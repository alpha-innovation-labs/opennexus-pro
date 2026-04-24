---
title: Leaf Template
scorers:
  - "leaf-template: Checks that leaf docs follow the required leaf template shape."
  - "leaf-usage: Checks that leaf docs show a concrete command or code usage example."
  - "leaf-input-output: Checks that leaf docs define typed input and output contracts."
  - "leaf-errors: Checks that operational leaf docs define typed error contracts."
  - "leaf-e2e: Checks that leaf docs list the expected scenario-level E2E coverage."
---


```text
<as per [[../Rules/I. Description|I. Description]]>

## Usage

<document one command, one callable unit, or one imported function as per [[../Rules/IV. Usage|IV. Usage]]>

## References (Optional)
<feature-local docs as per [[../Rules/X. References|X. References]]>

## Inputs
<contracts as per [[../Rules/V. Input-Ouput|V. Input-Ouput]]>

## Outputs
<contracts as per [[../Rules/V. Input-Ouput|V. Input-Ouput]]>

## Errors (Optional)
<contracts as per [[../Rules/IX. Errors|IX. Errors]]>

## E2E
<scenario as per [[../Rules/VII. E2E|VII. E2E]]>
```
