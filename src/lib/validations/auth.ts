import { z } from "zod";
export const signupSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});



export const loginSchema = z.object({
    email: z.string().email("please enter a valid email"),
    password: z.string().min(1, "Password is required")
});

export const forgetPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email")
});


export const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 chracters"),
    confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}
);