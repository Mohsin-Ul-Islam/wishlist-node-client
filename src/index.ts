import { Axios } from "axios";

/**
 * data structure for representing user
 */
interface User {
  /**
   * unique integer id of the user
   */
  id: number;

  /**
   * access token granted to user by the auth service
   */
  accessToken?: string;

  /**
   * refresh token granted to user by the auth service
   */
  refreshToken?: string;
}

/**
 * data structure for representing a single Wihslist item/line
 */
interface WishlistLine {
  /**
   * shopify product id of the item
   */
  productId: number;

  /**
   * id of the wishlist the product belongs to
   */
  wishlistId: number;
}

/**
 * data structure for representing the actual wishlist
 */
interface Wishlist {
  /**
   * unique integer id of the wishlist
   */
  id: number;

  /**
   * unique integer id of the user owning the wishlist
   */
  userId: number;

  /**
   * list of lines in the wishlist
   */
  lines: WishlistLine[];
}

/**
 * abstract interface of an http resource
 */
interface Resource<T> {
  /**
   * get the http resource or raise an error
   * @param id number
   */
  get(id: number): Promise<T>;

  /**
   * get the http resource or null
   * @param id number
   */
  optional(id: number): Promise<T | null>;

  /**
   * list the http resources (supports pagination)
   * @param pageNumber number
   */
  list(pageNumber: number): Promise<T[]>;
}

/**
 * abstract interface of wishlist http resource
 */
interface WishlistResource extends Resource<Wishlist> {
  /**
   * add item to wishlist
   * @param line WishlistLine
   */
  add(line: WishlistLine): Promise<Wishlist>;

  /**
   * remove item from wishlist
   * @param line WishlistLine
   */
  remove(line: WishlistLine): Promise<Wishlist>;
}

/**
 * Concrete implementation of Wishlist Http Resource
 */
class WishlistResource implements WishlistResource {
  // underlying axios client
  private readonly httpClient: Axios;

  public constructor(httpClient: Axios) {
    this.httpClient = httpClient;
  }

  list(pageNumber: number = 1): Promise<Wishlist[]> {
    return this.httpClient.get("/users/1/wishlists", {
      params: {
        page: pageNumber,
      },
    });
  }

  optional(id: number): Promise<Wishlist | null> {
    return this.httpClient.get(`/wishlists/${id}`);
  }

  get(id: number): Promise<Wishlist> {
    return this.httpClient.get(`/wishlists/${id}`).then((response) => {
      if (response.status != 200) throw new Error(response.status.toString());
      const data = JSON.parse(response.data);
      return {
        id: data.id_,
        userId: data.user_id,
        lines: data.lines,
      };
    });
  }

  add(line: WishlistLine): Promise<Wishlist> {
    return this.httpClient.post("/wishlists/1", JSON.stringify(line));
  }

  remove(line: WishlistLine): Promise<Wishlist> {
    return this.httpClient.delete(
      `/wishlists/${line.wishlistId}/lines/${line.productId}`
    );
  }
}

interface WishlistHttpClientOpts {
  key: string;
  secret: string;
  version?: string;
  host?: string;
  port?: number;
}

/**
 * the actual wishlist client class
 */
export class WishlistHttpClient {
  // wishlist service host url
  private readonly host: string;

  // wishlist service port
  private readonly port: number;

  // api version
  private readonly version: string;

  // api key
  private readonly key: string;

  // api secret
  private readonly secret: string;

  // wishlist http resource
  public readonly wishlists: WishlistResource;

  public constructor(opts: WishlistHttpClientOpts) {
    this.host = opts.host || "https://wishlist.mohsin.ninja";
    this.port = opts.port || 443;

    this.key = opts.key;
    this.secret = opts.secret;

    this.version = opts.version || "v1";

    // todo: get token from logging the user in
    // this is a fake token
    const token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.UIGp2674w1UQjIg3av5vbT1X-8lIIjZjPkkjsHJeAeY";

    this.wishlists = new WishlistResource(
      new Axios({
        baseURL: `${this.host}:${this.port}/api/${this.version}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }
}
