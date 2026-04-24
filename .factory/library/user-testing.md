# User Testing

Validation surfaces, required testing tools, and resource classification.

---

## Validation Surface

Surface: CLI subprocesses from the repository root.

Assertions are validated by running commands such as `just dev ping` and `just pong` and capturing exit code, stdout, and stderr exactly.

## Validation Concurrency

CLI subprocess validation is lightweight. Dry-run environment: 16 CPUs, 64 GiB RAM, existing focused node:test harness passed. Max concurrent CLI validators: 5. This mission only needs one validator because the command surface is small and exact-output checks are fast.

## Known Setup Notes

`npm test -- --unit` is not supported by this repository. Use focused `node_modules/.bin/tsx --test --test-concurrency=1 <test-files>` commands for targeted tests, and `npm test`/`just test` for the repository-selected full suite when appropriate.
