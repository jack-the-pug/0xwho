

interface Profile {
    name:string
    address:string
}
interface TDialog extends HTMLDialogElement{
    showModal:() => void
    close:() => void
}
const browser = chrome
let currentProfile:Profile | null = null  
let removeDialog:TDialog | null = null
let editDialog:TDialog | null = null

async function getContactsFromStorage(){
    const res = await browser.storage.sync.get()
    const arr = []
    for(const key in res){
     arr.push(res[key])
    }
    return arr
}

function removeHandler(profile:Profile){
    currentProfile = profile
    removeDialog && removeDialog.showModal()
}

function editHandler(profile:Profile){
    currentProfile = profile
    editDialog && editDialog.showModal()
    const form = document.getElementById('editForm') as HTMLFormElement
    form.reset()
    // @ts-ignore
    form.elements.name.value = currentProfile.name
     // @ts-ignore
    form.elements.address.value = currentProfile.address
}

const makeProfile = (profile:Profile):HTMLDivElement => {
    const tr = document.createElement('tr')
    tr.className = 'profile'
    tr.innerHTML = `
      <td style="padding-right: 12px;">${profile.address}</td>
      <td style="padding-right: 12px;">${profile.name}</td>
    `
    const removeTd = document.createElement('td')
    const remove = document.createElement('button')
    remove.innerText = 'remove'
    remove.onclick = () => removeHandler(profile)
    removeTd.appendChild(remove)

    const editTd = document.createElement('td')
    const edit = document.createElement('button')
    edit.innerText = 'edit'
    edit.onclick = () => editHandler(profile)
    editTd.appendChild(edit)
    tr.appendChild(removeTd)
    tr.appendChild(editTd)
    return tr
}

async function Render(){
    const list = await getContactsFromStorage()
    const container = document.getElementById('container')
    if (list.length > 0) {
        container!.innerHTML = ''
        list.forEach((p:Profile) => {
            const div = makeProfile(p)
            container!.appendChild(div)
        })
    } else {
        container!.innerHTML = '<tr><td>No data</td></tr>'
    }
}


const f = (t:string) => t.trim().toLowerCase()
function handleSubmit(e:Event,form:HTMLFormElement){
    e.preventDefault()
    const data = new FormData(form).entries()
    const profile:any = {}
    for(const [key,value] of data){
        profile[key] = value
    }

    profile.address = f(profile.address)
    if(!/^0x[a-fA-F0-9]{40}$/.test(profile.address)){
        alert('invalid address')
        return false
    }
    browser.storage.sync.set({[profile.address.toLowerCase()]:profile})
    form.reset()
    Render()
    return true
}

window.onload = async () => {
    const form = document.getElementById('formContent') as HTMLFormElement
    form.addEventListener('submit', (e) => handleSubmit(e,form))
    
    Render()

    removeDialog = document.getElementById('removeDialog') as TDialog
    removeDialog.addEventListener('close', () => currentProfile = null)
    removeDialog.addEventListener('cancel', () => currentProfile = null)
    removeDialog.addEventListener('submit', (e) => {
        const submiter = e.submitter
        if(submiter!.id === 'removeDialogConfirmBtn'){
            browser.storage.sync.remove(currentProfile?.address)
            currentProfile = null
            Render()
        }
    })
    

    editDialog = document.getElementById('editDialog') as TDialog
    editDialog.addEventListener('close', () => currentProfile = null)
    editDialog.addEventListener('cancel', () => currentProfile = null)
    editDialog.addEventListener('submit', (e) => {
        const submiter = e.submitter
        if(submiter!.id === 'editDialogSubmitButton'){
            browser.storage.sync.remove(currentProfile?.address)
           const r = handleSubmit(e,document.getElementById('editForm') as HTMLFormElement)
           r && editDialog?.close()
        }
    })
}


