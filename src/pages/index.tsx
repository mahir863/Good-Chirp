import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingPage from "~/components/loading";
import { useState } from "react";

dayjs.extend(relativeTime);

// Creating Post Wizard component
const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  if (!user) return null;

  const ctx = api.useContext();

  const { mutate, isLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
  });

  return (
    <div className="flex w-full gap-4">
      <img
        src={user?.profileImageUrl}
        alt={"Profile"}
        className="h-14 w-14 rounded-full"
      />
      <input
        type="text"
        placeholder="Type your thoughts here..."
        className="grow bg-transparent outline-none focus:outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />

      <button onClick={() => mutate({ content: input })}>Post</button>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
// Creating the Post View Component
const PostViewComponent = (props: PostWithUser) => {
  const { post, author } = props;
  if (!author) return null;
  return (
    <div
      key={post.id}
      className="flex items-center justify-start gap-5 border-b border-slate-400 p-3"
    >
      <img
        src={author?.profileImageUrl}
        alt="profile"
        className="h-10 w-10 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-3 text-slate-400 ">
          <span>{`@${author?.firstName ? author.firstName : "Guest"}`}</span>
          <span>{`${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <p>{post.content}</p>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();

  const user = useUser();
  console.log(user);

  if (!data || isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Head>
        <title>Good Chirp</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x md:max-w-2xl ">
          <div className="flex border-b border-slate-400 p-4 ">
            {!user.isSignedIn && <SignInButton />}
            {!!user.isSignedIn && (
              <div className="flex w-full justify-center gap-5">
                <CreatePostWizard />
                <SignOutButton />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {data?.map((fullPost) => (
              <PostViewComponent {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
