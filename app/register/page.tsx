// Registration page
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Form, Input } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";
import { ApplicationError } from "@/types/error";
import { RegisterRequest, User } from "@/types/user";

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const isAuthChecked = useRedirectIfAuthenticated("/users");

  // On succesfull registration, the user is logged-in
  // A session token is stored in local storage
  const { set: setToken } = useLocalStorage<string>("token", "");

  const handleRegister = async (values: RegisterRequest) => {
    setErrorMessage("");
    setIsSubmitting(true);

    // Execute and handle the POST request to the /users endpoint to create a user
    try {
      const response = await apiService.post<User>("/users", {
        ...values,
        bio: values.bio?.trim() ?? "",
      });

      // If succesful, store session token in local storage and
      // redirect to the user page of the new user
      if (response.token) {
        setToken(response.token);
      }
      router.push(`/users/${response.id}`);
    } catch (error) {
      const appError = error as ApplicationError;

      if (appError.status === 409) {
        setErrorMessage("This username is already taken.");
      } else if (appError.status === 400) {
        setErrorMessage("Please check your input and try again.");
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthChecked) {
    return null;
  }

  return (
    <div className="login-container">
      <Form
        form={form}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 8, message: "Password must be at least 8 characters." },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item name="bio" label="Bio (optional)">
          <Input.TextArea
            placeholder="Tell us something about yourself"
            rows={3}
          />
        </Form.Item>

        {errorMessage && (
          <Form.Item>
            <Alert type="error" showIcon message={errorMessage} />
          </Form.Item>
        )}

        {/* Register button to submit the form */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="auth-button"
            loading={isSubmitting}
          >
            Register
          </Button>
        </Form.Item>

        {/* Button to the login form */}
        <Form.Item>
          <Button
            type="default"
            className="auth-button"
            onClick={() => router.push("/login")}
          >
            Go to login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
