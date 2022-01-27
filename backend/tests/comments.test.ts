import request from "supertest";
import "regenerator-runtime";
import db from "mongoose";
import { IUserDocument } from "../src/types/user";
import server from "../src/app";
import configs from "../src/config";
import { createToken } from "../src/passport/strategies/jwt";

describe("댓글 통합 테스트", () => {
  const connection = db.createConnection(`${configs.mongoUri}/coderland`);
  let token = "Bearer ";
  let notAccessToken = "Bearer ";
  let postId: string;
  let commentId: string;

  beforeAll(async () => {
    await connection.collection("users").insertOne({
      googleId: "01010203040404",
      nickname: "testuser2",
      name: "family given2",
      profile: "profile photo url2",
      grade: 0,
    });

    const user = <IUserDocument>await connection.collection("users").findOne({
      googleId: "01010203040404",
    });

    token += createToken(user);

    await connection.collection("users").insertOne({
      googleId: "1734981374981123",
      nickname: "testuser2",
      name: "family given2",
      profile: "profile photo url2",
      grade: 0,
    });

    const notOwner = <IUserDocument>(
      await connection.collection("users").findOne({
        googleId: "1734981374981123",
      })
    );

    notAccessToken += createToken(notOwner);
  });

  it("일반 포스트 생성", async () => {
    // given
    const title = "to test comment title";
    const contents = "new contents";
    const subject = "article";
    const category = "none";

    // when
    const res = await request(server)
      .post("/api/posts")
      .set("authorization", token)
      .send({ title, contents, subject, category });

    // then
    expect(res.statusCode).toEqual(201);
    expect(res.body.isOk).toEqual(true);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["isOk", "postId"])
    );

    postId = res.body.postId;
  });

  it("일반 포스트 코멘트 생성 테스트", async () => {
    const contents = "comment contents";

    const res = await request(server)
      .post(`/api/posts/${postId}/comments`)
      .set("authorization", token)
      .send({ contents });

    expect(res.statusCode).toEqual(201);
    expect(res.body.isOk).toEqual(true);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["isOk", "commentId"])
    );

    commentId = res.body.commentId;
  });

  it("포스트 댓글 갯수 확인", async () => {
    const res = await request(server).get(`/api/posts/${postId}`).send();

    expect(res.body.post.commentCount).toEqual(1);
  });

  it("Fail 없는 포스트 코멘트 생성 테스트", async () => {
    const contents = "comment contents";

    const res = await request(server)
      .post("/api/posts/sadlkjflkasd/comments")
      .set("authorization", token)
      .send({ contents });

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.msg).toEqual("존재하지 않는 글입니다.");
  });

  it("일반 포스트 코멘트 리스트 테스트", async () => {
    const res = await request(server)
      .get(`/api/posts/${postId}/comments`)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(res.body.isOk).toEqual(true);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["isOk", "comments", "pagination"])
    );
  });

  it("댓글 수정 테스트", async () => {
    const contents = "update comment";

    const res = await request(server)
      .put(`/api/posts/${postId}/comments/${commentId}`)
      .set("authorization", token)
      .send({ contents });

    expect(res.statusCode).toEqual(200);
    expect(res.body.isOk).toEqual(true);

    const res1 = await request(server)
      .get(`/api/posts/${postId}/comments`)
      .send();

    expect(res1.body.comments[0].contents).toEqual("update comment");
  });

  it("Fail 댓글 수정 테스트 로그인 안함", async () => {
    const contents = "update comment";

    const res = await request(server)
      .put(`/api/posts/${postId}/comments/${commentId}`)
      .send({ contents });

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.msg).toEqual("로그인이 필요합니다!");
  });

  it("Fail 댓글 수정 테스트 권한 없음", async () => {
    const contents = "update comment";

    const res = await request(server)
      .put(`/api/posts/${postId}/comments/${commentId}`)
      .set("authorization", notAccessToken)
      .send({ contents });

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.msg).toEqual("권한이 없어요...");
  });

  it("Fail 일반 포스트 댓글 삭제 비로그인", async () => {
    const res = await request(server)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .send();

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.msg).toEqual("로그인이 필요합니다!");
  });

  it("Fail 일반 포스트 댓글 삭제 권한 문제", async () => {
    const res = await request(server)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set("authorization", notAccessToken)
      .send();

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.msg).toEqual("권한이 없어요...");
  });

  it("Fail 일반 포스트 댓글 삭제 없는 댓글", async () => {
    const res = await request(server)
      .delete(`/api/posts/${postId}/comments/lkasjdlkfjaslkdfj`)
      .set("authorization", token)
      .send();

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.msg).toEqual("존재하지 않는 댓글입니다.");
  });

  it("일반 포스트 댓글 삭제", async () => {
    const res = await request(server)
      .delete(`/api/posts/${postId}/comments/${commentId}`)
      .set("authorization", token)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(res.body.isOk).toEqual(true);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["isOk", "commentId"])
    );
  });

  it("포스트 댓글 갯수 확인", async () => {
    const res = await request(server).get(`/api/posts/${postId}`).send();

    expect(res.body.post.commentCount).toEqual(0);
  });

  let anonymousPostId: string;
  it("익명 포스트 생성", async () => {
    // given
    const title = "to test comment";
    const contents = "new contents";
    const subject = "chat";
    const category = "none";

    // when
    const res = await request(server)
      .post("/api/posts")
      .set("authorization", token)
      .send({ title, contents, subject, category });

    // then
    expect(res.statusCode).toEqual(201);
    expect(res.body.isOk).toEqual(true);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["isOk", "postId"])
    );

    anonymousPostId = res.body.postId;
  });

  it("익명 포스트 댓글 추가", async () => {
    const contents = "anony comment";

    const res = await request(server)
      .post(`/api/posts/${anonymousPostId}/comments`)
      .set("authorization", token)
      .send({ contents });

    expect(res.statusCode).toEqual(201);
    expect(res.body.isOk).toEqual(true);
  });

  it("익명 포스트 댓글 리스트 조회", async () => {
    const res = await request(server)
      .get(`/api/posts/${anonymousPostId}/comments`)
      .send();

    expect(res.statusCode).toEqual(200);
    expect(res.body.isOk).toEqual(true);
    expect(res.body.comments[0].anonymous).toEqual(true);
    expect(res.body.comments[0].author).not.toEqual("testuser2");
    expect(res.body.comments[0].author).toEqual("anonymity");
  });

  afterAll(async () => {
    await connection.collection("users").deleteMany({});
    await connection.collection("posts").deleteMany({});
    await connection.collection("comments").deleteMany({});
    await db.disconnect();
  });
});
