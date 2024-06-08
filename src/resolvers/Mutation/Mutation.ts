import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { jwtHelper } from "../../utils/jwtHelper";
import config from "../../config";

const prisma = new PrismaClient();

interface IUserInfo {
  name: string;
  email: string;
  password: string;
  bio?: string;
}

export const Mutation = {
  signup: async (parent: any, args: IUserInfo, context: any) => {
    const isExist = await prisma.user.findFirst({
      where: {
        email: args.email,
      },
    });

    if (isExist) {
      return {
        userError: "This user already exists!",
        token: null,
      };
    }

    const hashedPassword = await bcrypt.hash(args.password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: args.name,
        email: args.email,
        password: hashedPassword,
      },
    });

    if (args.bio) {
      await prisma.profile.create({
        data: {
          bio: args.bio,
          userId: newUser.id,
        },
      });
    }

    const token = await jwtHelper(
      { userId: newUser.id, email: newUser.email },
      config.jwt.secret as string
    );
    return {
      userError: null,
      token,
    };
  },

  signIn: async (parent: any, args: any, context: any) => {
    const user = await prisma.user.findFirst({
      where: {
        email: args.email,
      },
    });

    if (!user) {
      return {
        userError: "User is not found!",
        token: null,
      };
    }

    const correctPass = await bcrypt.compare(args.password, user.password);

    if (!correctPass) {
      return {
        userError: "Password is not correct!",
        token: null,
      };
    }

    const token = await jwtHelper(
      { userId: user.id, email: user.email },
      config.jwt.secret as string
    );

    return {
      userError: null,
      token,
    };
  },
};
