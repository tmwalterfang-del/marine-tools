import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {handleWorkspace} from '../../../../lib/workspace-service.mjs';
export const dynamic='force-dynamic';
async function handle(request:Request){const user=await getChatGPTUser();return handleWorkspace(request,{DB:env.DB},user?.userId);}
export const GET=handle;
export const POST=handle;
export const PUT=handle;
export const DELETE=handle;
