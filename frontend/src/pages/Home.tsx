import { useApi } from "../api";
import { dummyPostsResponse } from "../api/dummy";
import Loader from "../components/Loader";
import PostListItem from "../components/PostListItem";

export default function Home() {
  const response = useApi(dummyPostsResponse);

  if (!response) return <Loader />;

  return (
    <div>
      <h1>홈!</h1>
      <div className="post-list__wrapper">
        {response.posts.map(PostListItem)}
      </div>
    </div>
  );
}
