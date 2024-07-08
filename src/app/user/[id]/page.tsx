import Image from "next/image";
import { getUserDetails } from "~/server/queries";
import { Separator } from "~/components/ui/separator";

const images = ["/ninja.png", "/ninja.png", "/ninja.png", "/ninja.png"];

export default async function UserProfile({
  params: { id: userid },
}: {
  params: { id: string };
}) {
  const user = await getUserDetails(userid);
  return (
    <>
      <div className="flex flex-col px-2">
        <div className="mt-48 flex items-center justify-center gap-8">
          <div className="px-4">
            <Image
              className="rounded-full"
              src={user?.profileImageUrl || ""}
              height={100}
              width={100}
              alt=""
            />
          </div>

          <div className="mb-12 ">
            <div className="gap-4 py-4">
              <h1 className="text-md text-center text-white">
                {user?.fullName}
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex h-5  flex-row items-center justify-between space-x-4 text-sm">
                <div>posts</div>
                <Separator orientation="vertical" />
                <div>followers</div>
                <Separator orientation="vertical" />
                <div>following</div>
              </div>
              <div className="flex h-5 flex-row items-center justify-around space-x-4 text-sm">
                <div>NA</div>

                <div>NA</div>

                <div>NA</div>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-4" />

        <div className="flex flex-wrap items-center justify-between">
          {images.map((image, index) => (
            <div
              key={index}
              className="mb-2 flex w-1/3 items-start justify-center  rounded-md border-[1px] border-white/25 px-1"
              style={{ maxWidth: "33%" }}
            >
              <Image src={image} height={180} width={180} alt="" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
