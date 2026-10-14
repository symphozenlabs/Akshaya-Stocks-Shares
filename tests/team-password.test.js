import {describe,it,expect,vi} from 'vitest'
import {createTeamPasswordHandler} from '../api/team-password'

const admin={uid:'admin-uid',email:'akshayastocksshares@gmail.com',email_verified:true}
function setup(identity=admin,memberRole='staff'){
  const auth={verifyIdToken:vi.fn().mockResolvedValue(identity),getUser:vi.fn().mockResolvedValue({email:'team1@team.akshaya-ss.app'}),updateUser:vi.fn().mockResolvedValue({})}
  const doc={get:vi.fn().mockResolvedValue({exists:true,data:()=>({role:memberRole,authEmail:'team1@team.akshaya-ss.app'})})}
  const db={collection:vi.fn().mockReturnValue({doc:vi.fn().mockReturnValue(doc)})}
  const res={setHeader:vi.fn(),status:vi.fn().mockReturnThis(),json:vi.fn()}
  const req={method:'POST',headers:{authorization:'Bearer valid-token',host:'akshaya-ss.vercel.app',origin:'https://akshaya-ss.vercel.app'},body:{uid:'staff-uid',password:'TestPassword123!'}}
  return {handler:createTeamPasswordHandler(()=>({auth,db})),req,res,auth,db}
}
describe('administrator team password endpoint',()=>{
  it('rejects an unauthenticated request without reading team records',async()=>{const s=setup();delete s.req.headers.authorization;await s.handler(s.req,s.res);expect(s.res.status).toHaveBeenCalledWith(401);expect(s.db.collection).not.toHaveBeenCalled()})
  it('rejects staff callers even with valid authentication',async()=>{const s=setup({uid:'staff-uid',email:'team1@team.akshaya-ss.app',email_verified:true});await s.handler(s.req,s.res);expect(s.res.status).toHaveBeenCalledWith(403);expect(s.auth.updateUser).not.toHaveBeenCalled()})
  it('requires a verified administrator email',async()=>{const s=setup({...admin,email_verified:false});await s.handler(s.req,s.res);expect(s.res.status).toHaveBeenCalledWith(403)})
  it('rejects short passwords and arbitrary target roles',async()=>{const s=setup();s.req.body.password='short';await s.handler(s.req,s.res);expect(s.res.status).toHaveBeenCalledWith(400);const other=setup(admin,'administrator');await other.handler(other.req,other.res);expect(other.res.status).toHaveBeenCalledWith(404);expect(other.auth.updateUser).not.toHaveBeenCalled()})
  it('rejects cross-origin requests',async()=>{const s=setup();s.req.headers.origin='https://other.example';await s.handler(s.req,s.res);expect(s.res.status).toHaveBeenCalledWith(403);expect(s.auth.verifyIdToken).not.toHaveBeenCalled()})
  it('updates only the verified team member and never returns the password',async()=>{const s=setup();await s.handler(s.req,s.res);expect(s.auth.verifyIdToken).toHaveBeenCalledWith('valid-token',true);expect(s.auth.updateUser).toHaveBeenCalledWith('staff-uid',{password:'TestPassword123!'});expect(s.res.status).toHaveBeenCalledWith(200);expect(JSON.stringify(s.res.json.mock.calls)).not.toContain('TestPassword123!')})
})
