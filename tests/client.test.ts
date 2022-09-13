import { WishlistHttpClient } from "../src";

test("WishlistHttpClient", async () => {
  const client = new WishlistHttpClient({
    key: "aqua",
    secret: "s3cr3t",
    host: "http://localhost",
    port: 8080,
  });

  const wishlist = await client.wishlists.get(1);

  expect(wishlist.id).toEqual(1);
  expect(wishlist.userId).toEqual(1);
  expect(wishlist.lines).toHaveLength(4);
});
