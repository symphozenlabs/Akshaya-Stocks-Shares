import {describe,it,expect} from 'vitest'
import {IDLE_TIMEOUT_MS,remainingIdleTime} from './useIdleLogout'
describe('six-hour inactivity deadline',()=>{
  it('keeps an active session signed in until six hours have elapsed',()=>{expect(IDLE_TIMEOUT_MS).toBe(21600000);expect(remainingIdleTime(1000,1000+IDLE_TIMEOUT_MS-1)).toBe(1)})
  it('expires at six hours and after a sleeping browser resumes',()=>{expect(remainingIdleTime(1000,1000+IDLE_TIMEOUT_MS)).toBe(0);expect(remainingIdleTime(1000,1000+IDLE_TIMEOUT_MS+3600000)).toBe(0)})
  it('resets the deadline after activity in another tab',()=>{const now=50000000;expect(remainingIdleTime(now-60000,now)).toBe(IDLE_TIMEOUT_MS-60000)})
})
