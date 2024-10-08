import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import Comments from "./Comments";
import { Input } from "~/components/ui/input";
import {
  MessageCircle,
  MessageCirclePlus,
  CircleFadingPlus,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
interface CommentDrawerProps {
  imageId: number;
}

const CommentDrawer = ({ imageId }: CommentDrawerProps) => {
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { userId } = useAuth();

  const handleCommentPost = async () => {
    setLoading(true);
    console.log("comment btn pressed");

    try {
      console.log("sending post request");

      const userResponse = await fetch("/api/checkUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (userResponse.ok) {
        const userResult = await userResponse.json();
        if (!userResult.exists) {
          await fetch("/api/createUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });
        }
      } else {
        throw new Error("Failed to check user existence");
      }

      const response = await fetch("/api/postComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, imageId, content: comment }),
      });
      if (!response.ok) {
        throw new Error("Failed to update like status");
      }

      const result = await response.json();
      console.log("API response:", result);
    } catch (error) {
      console.error("failed to post a comment", error);
    } finally {
      router.refresh();
      setComment("");
      setLoading(false);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  return (
    <Drawer>
      <DrawerTrigger>
        <MessageCircle stroke="white" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-black dark:text-white">
            Comments
          </DrawerTitle>
          <DrawerDescription>please be disrespectful 🥰</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <Comments userId={userId || ""} imageId={imageId} />
        </div>
        <div className="px-4">
          <Input
            placeholder="Add a comment"
            className="px-4 text-white"
            value={comment}
            onChange={handleCommentChange}
          />
        </div>
        <DrawerFooter className="w-42">
          <Button
            onClick={handleCommentPost}
            className="w-42 mb-4"
            disabled={loading}
          >
            {loading ? <CircleFadingPlus /> : <MessageCirclePlus />}
          </Button>
          <DrawerClose>
            <Button className="text-black dark:text-white" variant="secondary">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentDrawer;
