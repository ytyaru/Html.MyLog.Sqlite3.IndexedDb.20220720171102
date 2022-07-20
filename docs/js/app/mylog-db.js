class MyLogDb {
    constructor() {
        this.version = 1
        this.name = `mylog-${this.version}.db`
        this.dexie = new Dexie(this.name)
        this.create()
    }
    create() {
        this.dexie.version(this.version).stores({
            comments: `++id`,
        })
    }
    //async clear() { await this.dexie.comments.clear() }
    async clear() {
        await this.dexie.comments.clear()
        /*
        // エラー: Uncaught (in promise)  DatabaseClosedError Database has been closed 
        this.dexie.close();
        await this.dexie.delete();
        this.dexie.close();
        this.create()
        */
    }
    async delete(ids) {
        console.debug(ids)
        const isAll = (0===ids.length)
        const msg = ((isAll) ? `つぶやきをすべて削除します。` : `選択したつぶやきを削除します。`) + `\n本当によろしいですか？`
        if (confirm(msg)) {
            console.debug('削除します。')
            if (isAll) { console.debug('全件削除します。'); await this.dexie.comments.clear() }
            else { console.debug('選択削除します。'); for (const id of ids) { await this.dexie.comments.delete(id) } }
            //else { console.debug('選択削除します。'); for (const id of ids) { await this.dexie.comments.delete(id) } }
            //else { console.debug('選択削除します。'); for (const id of ids) { await this.dexie.comments.delete({id:id}) } }
            //else { console.debug('選択削除します。'); for (const id of ids) { await this.dexie.comments.where('id').equals(id).delete() } }
            console.debug(await this.dexie.comments.toArray())
        }
    }
    async insert(content, now) {
        console.debug(`挿入`, content, now)
        //const now = Math.floor(new Date().getTime() / 1000)
        const id = await this.dexie.comments.put({
            content: content,
            created: now,
        })
        console.debug(id, content, now)
        return this.#insertHtml(id, content, now)
    }
    //#insertHtml(content, created) { return `<p>${this.#toContent(content)}<br>${this.#toTime(created)}</p>` }
    #insertHtml(id, content, created) { return `<p>${this.#toContent(content)}<br>${this.#toTime(created)}${this.#toDeleteCheckbox(id)}</p>` }
    async toHtml() {
        const cms = await this.dexie.comments.toArray()
        cms.sort((a,b)=>b.created - a.created)
        return cms.map(c=>this.#insertHtml(c.id, c.content, c.created)).join('')
        //return cms.map(c=>this.#insertHtml(c.content, c.created)).join('')
        //return Promise.all(cms.map(async(c)=>this.#insertHtml(c.content, c.created)).join('')
    }
    #toTime(created) {
        const d = new Date(created * 1000)
        const u = d.toISOString()
        const l = d.toLocaleString({ timeZone: 'Asia/Tokyo' })
        return `<time datetime="${u}">${l}</time>`
    }
    #toContent(content) {
        return content.replace(/\r\n|\n/g, '<br>')
    }
    #toDeleteCheckbox(id) {
        return `<label><input type="checkbox" name="delete" value="${id}">❌<label>`
    }
}
