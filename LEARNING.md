# WebRTC From Hussain nassir

## Demo

- Without opening VScode, but writing code directly in browser devtools and connecting to browser. below is explaination from claude about code written in browsers to connect it.

Good instinct — copying a tutorial gets you a working demo, but not the ability to rebuild it under pressure. Let's trace your _actual_ commands line by line, like a debugger, so you understand exactly what each API call is doing and why it was needed.

### Phase 1 — Browser A sets up the connection

```js
const lc = new RTCPeerConnection();
```

This creates one connection object dedicated to _one_ remote peer. Internally, the browser spins up three subsystems tied to this object: an **ICE agent** (finds network paths), a **DTLS engine** (encrypts everything, WebRTC refuses to send anything unencrypted), and an **SCTP layer** (this is what actually carries your data channel messages, layered over DTLS over UDP). You don't touch these directly — they're triggered by the calls below.

```js
const dc = lc.createDataChannel("channel");
```

This is the critical line that makes everything else meaningful. `createDataChannel` doesn't just create a local object — it tells `lc` "I have something to negotiate." When you generate an offer later, the SDP will now contain a data channel section (`m=application ... webrtc-datachannel`) _because_ you called this first. If you'd skipped this and just called `createOffer()`, you'd get back an SDP with nothing useful in it — there'd be no media, no data channel, nothing to agree on.

```js
dc.onmessage = (e) => console.log("New Message" + e.data);
dc.onopen = (e) => console.log("Connection opened!");
```

Just registering callbacks. Note: assigning to `.onmessage`/`.onopen` (rather than `addEventListener`) means only one handler can exist at a time — if you reassign it, the old one is gone. Nothing fires yet; the channel doesn't exist on the wire until negotiation completes.

```js
lc.onicecandidate = e => console.log(...)
```

This registers the callback for whenever the ICE agent, running in the background, discovers a new way to reach this browser (a new local IP/port combination). It hasn't started yet — that happens next.

### Phase 2 — creating the offer

```js
lc.createOffer()
  .then((o) => lc.setLocalDescription(o))
  .then((a) => console.log("set successfully"));
```

Two separate things happen here:

- `createOffer()` looks at everything you've attached to `lc` (in your case, the data channel) and generates an SDP blob describing it. Returns a promise.
- `setLocalDescription(o)` takes that SDP and applies it _locally_. This is the line that actually kicks off ICE gathering — the moment you call this, the browser starts enumerating your network interfaces and firing `onicecandidate` for each one it finds.

That's exactly what you see next in your log — `onicecandidate` fired three times in a row, each one reprinting `lc.localDescription` with one more `a=candidate:...` line appended (first 1 candidate, then 2, same SDP body otherwise). This is called **trickle ICE**: candidates arrive progressively, not all at once, because the browser discovers network interfaces one at a time.

You then manually grabbed the _last_ printed SDP (the one with 2 candidates) and pasted it into Browser B as `offer`. That's a valid but non-standard way to do signaling — in production you'd either send each candidate separately as it trickles in (faster connection setup), or wait until `lc.iceGatheringState === 'complete'` before sending one final SDP. You did a manual version of the second approach.

### Phase 3 — Browser B receives the offer

```js
const rc = new RTCPeerConnection()
rc.onicecandidate = e => console.log(...)
```

Same setup as A — new connection object, register the candidate-discovery callback.

```js
rc.ondatachannel = (e) => {
  rc.dc = e.channel;
};
```

Here's the piece that has no equivalent on the offering side, and it's important to understand _why_ it exists. On Browser A, **you** called `createDataChannel` to make the channel. On Browser B, nobody called that — B doesn't create its own channel. Instead, once the SDP negotiation tells B "there's a data channel coming," the browser automatically constructs a matching channel object on B's side and fires the `datachannel` event with it. `e.channel` **is** B's end of the exact same logical channel A created. You correctly rewrote this handler three times, refining it — final version wires up `onmessage` and `onopen` on `rc.dc`.

```js
rc.setRemoteDescription(offer).then((a) => console.log("offer set!!"));
```

This is where B actually parses A's SDP and understands what's being proposed. This triggers the `datachannel` event you just registered a handler for.

```js
rc.createAnswer()
  .then((a) => rc.setLocalDescription(a))
  .then(console.log("answer created!!"));
```

Same two-step pattern as A's offer: `createAnswer()` generates an SDP that's compatible with what A proposed, then `setLocalDescription(a)` applies it and — same as before — kicks off B's own ICE gathering, which is why you see B's `onicecandidate` fire next.

**One bug worth flagging**, because it's a classic promise mistake and you're actively studying JS async internals: `.then(console.log('answer created!!'))` — this logs immediately, at the moment the line _runs_, regardless of whether the promise has resolved. It's not actually a callback; you're calling `console.log` right there and passing its return value (`undefined`) as the `.then` handler. The correct version is `.then(() => console.log('answer created!!'))` — wrapping it in an arrow function so it only runs when the promise resolves. It happened to look right in your log purely by coincidence of timing.

### Phase 4 — closing the loop

You copied B's final answer SDP back to A:

```js
lc.setRemoteDescription(answer);
```

This is the moment both sides finally have a complete picture — A knows its own description and B's answer, B knows its own description and A's offer. Now the ICE agent on both sides can actually try connecting: since your candidates were all `typ host` (same machine), the connection succeeds almost instantly, DTLS handshake completes, SCTP channel opens, and:

```
Connection opened!  // fires on both onopen handlers
```

```js
dc.send("helllo peer B");
```

Now that the channel is open, this works — and it's a **direct** call, no signaling server involved, no relay. The message goes straight from A's browser to B's browser over the connection you just built.

### The mental model to keep (so you can rebuild this without a tutorial)

1. `RTCPeerConnection` = one object per remote peer, manages ICE + DTLS + SCTP under the hood.
2. Attach something to negotiate _before_ creating the offer: `createDataChannel()` for data, `addTrack()` for media.
3. **Offering side**: `createOffer()` → `setLocalDescription()` → send SDP via signaling → wait for answer → `setRemoteDescription(answer)`.
4. **Answering side**: `setRemoteDescription(offer)` → `createAnswer()` → `setLocalDescription()` → send answer back via signaling.
5. `onicecandidate` fires as the ICE agent finds ways to reach you — in production, send each candidate to the other side as it arrives rather than waiting.
6. `ondatachannel` is the mirror image of `createDataChannel` — it's how the non-creating side gets its handle to the same channel.
7. `setLocalDescription` is the trigger for ICE gathering to start — that's the thing to remember when you're wondering "why does nothing happen until I call this."
