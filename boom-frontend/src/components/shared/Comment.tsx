import * as z from "zod";
import { useForm } from "react-hook-form";
import { Models } from "appwrite";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentValidation } from "@/lib/validation";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "../ui";
import { useCreateComment } from "@/lib/react-query/queries";
import { useToast } from "../ui/use-toast";
import { Loader } from ".";

type PostStatsProps = {
    post: Models.Document;
    user: Models.Document;
    refetchComment: () => void;
};

const Comment = ({ post, user, refetchComment }: PostStatsProps) => {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            text: "",
        },
    });

    // Query
    const { mutateAsync: createComment, isPending } = useCreateComment();

    const handleSignup = async (value: z.infer<typeof CommentValidation>) => {
        const newPost = await createComment({
            ...value,
            userId: user.id,
            postId: post.$id,
        });

        if (newPost) {
            form.reset();
            refetchComment();
          } else {
            toast({ title: "Comment failed. Please try again.", });
          }
    }

    return (
        <div className="w-full" >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSignup)}
                    className="flex justify-between items-center gap-2 w-[100%] mt-2">
                    <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                            <textarea required className={`y-scroll resize-none text-${isPending ? "[#4f4e4e]" : "white"}  bg-[#000000] w-[90%] focus:outline-none`} {...field} placeholder="Add a comment..." />
                        )}
                    />
                    {isPending ? (<Loader />) : ""}
                    <Button type="submit" className="w-[10%] hover:text-[#877eff]">
                        {/* {isCreatingAccount || isSigningInUser || isUserLoading ? ( */}
                        {/* <div className="flex-center gap-2"> */}
                        {/* <Loader /> Loading... */}
                        {/* </div> */}
                        {/* ) : ( */}
                        Post
                        {/* )} */}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default Comment;