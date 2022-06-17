interface OXWHOProfile {
    name: string
    address: string
}
interface OXWHOTooltipPosition {
    x: number
    y: number
    w: number
    h: number
}

interface TElement extends Element{
    OXWHO_text?: string 
    OXWHO_address?: string
}

export class OXWHOInject{
    public browser: any

    public addressMap: Map<string,OXWHOProfile> = new Map()
    public formatAddressMap: Map<string,string> = new Map()
    private tooltipEl: HTMLDivElement = document.createElement('div')
    private tooltipTemplate = `
      <div>{{NAME}}</div>
    `
    private sourceDoms:Map<TElement,string> = new Map()
    constructor() {
        this.init()
    }
    private async init() {
        this.browser = chrome
        this.tooltipEl.id = 'OXWHO-tip'
        await this.setAddressMap()

        window.addEventListener('load', () => {
           let timer = setTimeout(() => {
            this.changeDom()
            clearTimeout(timer)
           }, 1000)
        })

        document.addEventListener('selectionchange', () => this.handleSelectionchange())
       
        this.browser.storage.onChanged.addListener(async () => {
            this.sourceDoms.forEach((_,dom) => {
                dom.textContent = dom.OXWHO_text!
            })
            await this.setAddressMap()
            this.changeDom()
        })
        
        document.addEventListener('hashchange', this.changeDom)
        document.addEventListener('popstate', this.changeDom)
        document.addEventListener('pushstate', this.changeDom)

        let timer:ReturnType<typeof setTimeout> 
        document.addEventListener('scroll', () => {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                this.changeDom()
                clearTimeout(timer)
            }, 200)
        })
    }
    async setAddressMap() {
        const contacts = await this.browser.storage.sync.get()
        for (const addressKey in contacts) {
            const profile = contacts[addressKey]
            this.addressMap.set(profile.address,profile)
            const address = profile.address.toLowerCase()
            const formatStr = this.replaceAddressByName(address,profile?.name).toLowerCase()
            this.formatAddressMap.set(address,formatStr)
            this.formatAddressMap.set(formatStr,address)
        }
    }
    replaceAddressByName(address:string, name:string) {
        const nameLen = name.length
        return nameLen <= 36 ? `0x${name}_${address.substring(nameLen + 3)}` : `0x${name.substring(0,35)}_${address.substring(38)}`
    }
    handleSelectionchange () {
        const selection = this.getSelectedMeta()
        if (!selection) return
        let [text,el] = selection
        if (this.isAddress(text)) {
            text = text.toLowerCase()
            if (el.childNodes.length === 0) el = el.parentElement!
            const position = this.getPosition(el)
            const profile = this.addressMap.get(text.toLowerCase())!
            this.addTooltip(position,profile)
            return
        }

        if (!this.formatAddressMap.has(text.toLowerCase())) return
        const address = this.formatAddressMap.get(text.toLowerCase())!

        if (this.isAddress(address)) {
            // @ts-ignore
            el.textContent =  el.textContent?.replace(text, el.OXWHO_address)!
            const selc = window.getSelection()
            selc?.removeAllRanges()
            const range = document.createRange()
            range.selectNode(el)
            selc?.addRange(range)
        }
    }
    isAddress(text:string, strict:boolean = true): boolean {
        return strict ? /^0x[a-fA-F0-9]{40}$/.test(text) : /0x[a-fA-F0-9]{40}/g.test(text)
    }
    getPosition(el:HTMLElement): {x:number,y:number,h:number,w:number} {
        const rect = el.getBoundingClientRect()
        const style = window.getComputedStyle(el)
        return {
            y: rect.y + window.scrollY + rect.height - parseFloat(style.paddingBottom),
            x: rect.x + window.scrollX +  parseFloat(style.paddingLeft),
            h: rect.height,
            w: rect.width
        }
    }
    private getSelectedMeta(): null | [string,HTMLElement] {
        const selection = window.getSelection()
        if (!selection) return null
        let text = selection.toString().trim()
        if (!text && document.getElementById('OXWHO-tip')) {
            document.body.removeChild(this.tooltipEl)
            return null
        }
        let el = selection.getRangeAt(0).startContainer
        if (el.nodeName === '#text' && el.nodeType === 3) el = el.parentElement as HTMLElement
        return [text,el as HTMLElement]
    }
    private getAddressDoms(): Map<Element,string> {
        const doms = document.querySelectorAll('* :not(script) :not(style) :not(a) :not(img) :not(input) :not(textarea) ')
        const nodeMap:Map<TElement,string> = new Map()
        doms.forEach((dom:TElement) => {
           let text = dom.textContent?.trim()   
           dom.OXWHO_text = text
           if (!text || dom.childNodes.length !== 1 || dom.firstChild?.nodeName !== '#text') return
           // there can be multiple matches (addresses) in one element
           const textIter = text.matchAll(/0x[a-fA-F0-9]{40}/g)
           for (let matchRes of textIter) {
             const address = matchRes[0]
             if (this.addressMap.has(address.toLowerCase())) {
                // save the original address, for later revertion of the inline labeling edit
                dom.OXWHO_address = address
                nodeMap.set(dom, dom.textContent!)
             }
           }
        })
        return nodeMap
    }
    changeDom() {
        const doms = this.getAddressDoms()
        this.sourceDoms = doms
        doms.forEach((text:string,node:TElement,)=> {
            const matchTextAddress = text.matchAll(/0x[a-fA-F0-9]{40}/g)
            for (const matchRes of matchTextAddress) {
                const address = matchRes[0]
                if (this.formatAddressMap.has(address.toLowerCase())) {
                    const formatAddress = this.replaceAddressByName(node.OXWHO_address!,this.addressMap.get(address.toLowerCase())!.name)
                    text= text.replace(address,formatAddress)
                }
            }
            node.textContent =text
        })
    }
    addTooltip(position:OXWHOTooltipPosition, profile:OXWHOProfile) {
         const {x,y,w} = position
         this.tooltipEl.style.left = `${x + w/2}px`
         this.tooltipEl.style.top = `${y}px`
         this.tooltipEl.innerHTML = this.tooltipTemplate.replace('{{NAME}}',profile.name)
         document.body.appendChild(this.tooltipEl)
    }
}


new OXWHOInject()