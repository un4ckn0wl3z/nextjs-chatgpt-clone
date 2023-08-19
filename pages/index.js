import Head from "next/head";
import Link from "next/link";
import {useUser} from '@auth0/nextjs-auth0/client'
import { getSession } from "@auth0/nextjs-auth0";



export default function Home() {

  const {isLoading, error, user} = useUser();

  if(isLoading) return <div>Loading...</div>
  if(error) return <div>{error.message}</div>

  return (
    <>
      <Head>
        <title>Next JS ChatGPT Login or Signup</title>
      </Head>
      <div className="flex justify-center min-h-screen items-center w-full bg-gray-800 text-white text-center">
        <div>
        {
          !!user && <Link href="/api/auth/logout">Logout</Link>
        }
        {
          !user && (
            <div className="flex gap-5 p-5">
              <Link href="/api/auth/login" className="btn">Login</Link>
              <Link href="/api/auth/signup" className="btn">Signup</Link>
            </div>
          )
        }
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req, ctx.res)
  if (!!session) {
    return {
      redirect: {
        destination: '/chat'
      }
    }
  }

  return {
    props: {}
  }
} 
