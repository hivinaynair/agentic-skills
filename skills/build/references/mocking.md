# When to mock

Adapted from Matt Pocock's `tdd` skill, MIT licensed; see [LICENSE-tdd.txt](LICENSE-tdd.txt).

Mock at system boundaries only: external APIs (payment, email, tax), time and
randomness, and sometimes the file system or database (prefer a test database).
Never mock your own modules or anything else you control.

Design boundaries so they are easy to replace in a test:

```typescript
// Easy: the client is passed in.
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard: the client is created inside.
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

Prefer one function per external operation over one generic fetcher, so each fake
returns one shape and a test shows which operations it uses:

```typescript
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  createOrder: (data) => fetch("/orders", { method: "POST", body: data }),
};
```

A test that mocks the layer it is meant to prove proves nothing: a test of a
database rule runs against a database, a test of a payment webhook against the
provider's sandbox or recorded events.
