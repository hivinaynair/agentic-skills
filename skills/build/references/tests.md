# Good and bad tests

Adapted from Matt Pocock's `tdd` skill, MIT licensed; see [LICENSE-tdd.txt](LICENSE-tdd.txt).
Name each test after the criterion it proves, as the task plan does.

## Good: behavior through the public interface

```typescript
test("J3.S1.c1: customer can check out with a valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

It tests what a caller cares about, through the public API only, survives
refactors, and makes one logical assertion.

## Bad: coupled to the implementation

```typescript
// Breaks when the code is refactored, though behavior is unchanged.
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});

// Bypasses the interface to verify.
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// Better: verify through the interface.
test("J1.S2.c1: a created user can be retrieved", async () => {
  const user = await createUser({ name: "Alice" });
  expect((await getUser(user.id)).name).toBe("Alice");
});
```

Warning signs: mocking your own modules, testing private methods, asserting call
counts or order, a name that says how rather than what.

## Bad: tautological

```typescript
// The expected value is computed the way the code computes it, so it always passes.
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  expect(calculateTotal(items)).toBe(items.reduce((s, i) => s + i.price, 0));
});

// Better: an independent, known value.
test("J2.S1.c2: the total is the sum of the line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```

## Bad: more tests than criteria

```typescript
// Five tests for one rule ("guest orders earn nothing"), plus tests of a helper.
test("guest order earns 0", …);
test("guest order with shipping earns 0", …);
test("guest order with discount earns 0", …);
test("guest order of 0.01 earns 0", …);
test("isGuest returns true for orders without a customer id", …);

// Better: the one planned test for the criterion.
test("J1.S1.c2: guest order earns nothing", …);
```

Add a variation only when it is a different criterion, or a bug you found.
