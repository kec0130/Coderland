import { IUserDocument } from "user";
import { IPostDocument, IPostModel } from "post";
import { parsePostBySubject } from "../utils";

export default class PostService {
  PostModel: IPostModel;

  constructor(PostModel: IPostModel) {
    this.PostModel = PostModel;
  }

  async findAllPosts(
    subject: string,
    category: string,
    currentPage: number,
    perPage: number
  ) {
    const [posts, pagination] = await this.PostModel.findAllPosts(
      subject,
      category,
      currentPage,
      perPage
    );
    const parsedPosts = posts.map((post) =>
      parsePostBySubject(post.subject, post.toObject())
    );
    return [parsedPosts, pagination];
  }

  async findPostById(postId: string, userId: string) {
    try {
      const post = await this.PostModel.findPostById(postId);
      return parsePostBySubject(post.subject, post.toObject(), userId);
    } catch (error) {
      throw new Error("존재하지 않는 글입니다.");
    }
  }

  async createPost(
    user: IUserDocument,
    postDto: Partial<IPostDocument>,
    gatherDto?: Partial<IPostDocument>
  ) {
    const post = await this.PostModel.createPost(user, postDto, gatherDto);
    return post.id;
  }

  async updatePost(
    postId: string,
    postDto: Partial<IPostDocument>,
    gatherDto: Partial<IPostDocument>
  ) {
    await this.PostModel.updatePost(postId, postDto, gatherDto);
  }

  async deletePost(postId: string) {
    await this.PostModel.deletePost(postId);
  }

  async completePost(postId: string) {
    await this.PostModel.completePost(postId);
  }

  async updateLike(postId: string, userId: string) {
    await this.PostModel.updateLike(postId, userId);
  }
}
