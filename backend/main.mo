import Int "mo:base/Int";
import Text "mo:base/Text";

import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor {

  public type Post = {
    id: Int;
    title: Text;
    body: Text;
    author: Principal;
    timestamp: Time.Time;
  };

  stable var posts: [Post] = [];

  public shared({ caller }) func createPost(title: Text, body: Text) : async Int {
    let postId = Time.now();
    let newPost: Post = {
      id = postId;
      title = title;
      body = body;
      author = caller;
      timestamp = postId;
    };
    posts := Array.append([newPost], posts);
    return postId;
  };

  public query func getPosts() : async [Post] {
    return posts;
  };
};
