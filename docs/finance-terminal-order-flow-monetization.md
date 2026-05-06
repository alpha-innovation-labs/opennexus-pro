# Finance terminal order-flow monetization check

Date: 2026-05-06

Scope: follow-up check for whether selected finance/crypto terminal projects appear to monetize order flow through referral, affiliate, partner, broker-program, builder-fee, or similar identifiers attached to order submission or trade links.

## Summary

No checked order path showed evidence of broker-program monetization where the project earns revenue because orders are routed with a referral, affiliate, builder, partner, or fee-recipient identifier.

This does not prove such broker programs do not exist in the broader crypto/finance market. It only means the checked repos did not show that mechanism in the inspected source paths.

## Findings

| Repo / integration | Finding | Evidence checked |
|---|---|---|
| [`NYTEMODEONLY/polyterm`](https://github.com/NYTEMODEONLY/polyterm) | No referral link or order-flow rebate mechanism found. It does not post orders; `quicktrade` only prepares analysis and opens a plain Polymarket event URL. | `polyterm/cli/commands/quicktrade.py` states the tool does not execute trades and builds URLs like `https://polymarket.com/event/{slug}` with no `ref`, `utm`, affiliate, or partner parameter. |
| [`Ashutosh0x/rust-finance`](https://github.com/Ashutosh0x/rust-finance) Alpaca order path | No referral or affiliate signal found in Alpaca order posting. | `crates/execution/src/alpaca_executor.rs` maps internal orders to Alpaca JSON and only passes normal order fields plus `client_order_id`; `crates/ingestion/src/alpaca/rest.rs` posts to `/v2/orders` with normal Alpaca API credentials. |
| [`Ashutosh0x/rust-finance`](https://github.com/Ashutosh0x/rust-finance) Polymarket CLOB order path | No referral, builder-fee, or fee-recipient signal found in the CLOB order body. | `crates/polymarket/src/clob.rs` posts to `/order` with `{ order, signature, orderType, owner }`; the signed order sets `fee_rate_bps` to `0` and includes no builder, affiliate, referrer, or fee-recipient field. |

## Source-level notes

### PolyTerm

The `quicktrade` command is positioned as trade preparation, not execution. It searches markets, calculates trade details and protocol-fee estimates, then builds a Polymarket URL:

```text
https://polymarket.com/event/{market_slug}
```

or:

```text
https://polymarket.com/event/{market_id}
```

No referral query parameters or affiliate-style identifiers were found in the checked URL construction.

### rust-finance: Alpaca

The Alpaca executor constructs a normal Alpaca order request containing fields such as symbol, quantity, side, order type, time-in-force, optional limit price, and `client_order_id`.

The REST client posts directly to:

```text
/v2/orders
```

with standard Alpaca authentication headers:

```text
APCA-API-KEY-ID
APCA-API-SECRET-KEY
```

No affiliate, partner, referral, or order-source revenue field was found in the checked Alpaca order submission path.

### rust-finance: Polymarket CLOB

The Polymarket CLOB client signs and posts an order body containing:

```text
{ order, signature, orderType, owner }
```

The checked signed order fields include maker, signer, taker, token id, amounts, expiration, nonce, `fee_rate_bps`, side, and signature type. The checked implementation sets:

```text
fee_rate_bps = "0"
```

No builder fee, fee recipient, referrer, affiliate, partner, or broker-program field was found in the checked CLOB order posting path.

## Conclusion

The “wrapper around monetization” pattern remains real for several finance terminals, especially where the terminal wraps a paid API, broker, exchange, or Pro-gated provider. For the specific Alpaca and PolyTerm/Polymarket order-flow question, the checked code does not show referral-based or rebate-based order monetization.
