export function isAuthed(){
  return !!localStorage.getItem('authToken')
}
export async function login(email,password){
  // demo: always success
  const token = btoa(email+'|'+(Date.now()))
  localStorage.setItem('authToken', token)
  localStorage.setItem('me', JSON.stringify({
    name: 'Awardee GenBI',
    email,
    phone: '08xxxxxxxxxx',
    faculty: 'Fakultas Ilmu Komputer',
    study: 'Sistem Informasi'
  }))
  return true
}
export function logout(){
  localStorage.removeItem('authToken')
}
export function getMe(){
  try{ return JSON.parse(localStorage.getItem('me')||'{}') }catch{ return {} }
}
export function setMe(next){
  localStorage.setItem('me', JSON.stringify(next))
}
