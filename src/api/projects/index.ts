import { NextApiRequest, NextApiResponse } from "next";


export async function GET(request:NextApiRequest){

    const query = request.query

    const data = 'this is data'
    return new Response(JSON.stringify({data:data, success:true, message:'data fetched successfully'}))
}