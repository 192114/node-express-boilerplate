type LoginBodyType = {
  email: string;
  password: string;
};

export const loginService = async (body: LoginBodyType) => {
  return {
    token: "1111",
    refreshToken: "222",
  };
};
