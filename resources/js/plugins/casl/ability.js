import { Ability } from '@casl/ability'
export const initialAbility = [
  {
    action: 'read',
    subject: 'Auth',
  },
]

//  Read ability from localStorage, all API calls has middleware checking abilities with the db. In that case it's a secure solution
const userData = JSON.parse(localStorage.getItem('user'))
const existingAbility = userData && userData.abilities ? userData.abilities : null
export default new Ability(existingAbility || initialAbility)
