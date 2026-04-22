import { getServerSession } from "next-auth";

export default async function Chat() {
  const session = await getServerSession();

  return <div>Welcome {session?.user?.email}</div>;
}