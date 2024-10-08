"use client";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UploadButton } from "~/utils/uploadthing";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { SimpleUploadButton } from "../app/posts/simple-upload-button";
import { SquarePlus } from "lucide-react";

import { ModeToggle } from "./darkModeToggle";
import { Button } from "~/components/ui/button";
import { NewPostDialog } from "~/app/posts/NewPostDialog";
type Props = {
  className?: string;
};
const TopNav = ({ className }: Props) => {
  const router = useRouter();
  const user = useUser();

  return (
    <header className="bg-black/40q fixed left-0 right-0 top-0 z-[100] flex items-center justify-between border-b-[1px] border-neutral-900   px-4 py-4 backdrop-blur-xl">
      <aside className="flex items-center gap-[2px]">
        <Link href="/">
          <Image
            src="/Logodropdown.png"
            width={100}
            height={100}
            alt=""
          ></Image>
        </Link>
      </aside>
      <nav className="absolute left-[50%] top-[50%] hidden translate-x-[-50%] translate-y-[-50%] transform md:block"></nav>
      <div className="flex flex-row gap-2 ">
        {user.isSignedIn ? (
          <>
            {/* <div className="relative z-50">
              <ModeToggle />
            </div> */}
            <button>
              {/* WIP// POST MODAL  */}
              {/* <SimpleUploadButton /> */}

              <NewPostDialog />
            </button>

            <UserButton />
          </>
        ) : (
          <div className="max-w-18">
            <SignInButton>
              {/* <aside className="flex items-center gap-4">
                <div className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    {"Sign In"}
                  </span>
                </div>
              </aside> */}
              <Button className="text-white" variant="outline">
                {" "}
                {"Sign In"}
              </Button>
            </SignInButton>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNav;
