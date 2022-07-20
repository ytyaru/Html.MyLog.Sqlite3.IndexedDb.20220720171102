class MyLogDownloader {
    constructor(db) {
        this.SQL = null
        this.db = db
    }
    /*
    async download(ext='db') { // zip版
        Loading.show()
        this.zip = new JSZip()
        const content = await this.#makeDb()
        this.zip.file(`mylog.${ext}`, content)
        //this.#makeHtmlFiles(files)
        //await Promise.all([this.#makeHtmlFiles(), this.#makeJsFiles(), this.#makeImageFiles()])
        const file = await this.zip.generateAsync({type:'blob', platform:this.#getOs()})
        const url = (window.URL || window.webkitURL).createObjectURL(file);
        const download = document.createElement('a');
        download.href = url;
        download.download = `mylog.zip`;
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        Toaster.toast(`ZIPファイルをダウンロードしました！`)
    }
    */
    async download(ext='db') { // https://stackoverflow.com/questions/24966020/saving-uint8array-to-a-sqlite-file
        Loading.show()
        const content = await this.#makeDb()
        const url = (window.URL || window.webkitURL).createObjectURL(new Blob([content], {type: 'application/octet-stream'}));
        const download = document.createElement('a');
        download.href = url;
        download.download = `mylog.${ext}`;
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        Toaster.toast(`DBファイルをダウンロードしました！`)
    }
    #getOs() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("windows nt") !== -1) { return 'DOS' }
        return 'UNIX'
    }
    async #makeDb() {
        if (!this.SQL) { this.SQL = await initSqlJs({locateFile: file => `lib/sql.js/1.7.0/${file}`}) }
        const db = new this.SQL.Database();
        db.exec(`BEGIN;`)
        await this.#makeTableComments(db)
        db.exec(`COMMIT;`)
        return db.export()
    }
    async #makeTableComments(db) {
        db.exec(this.#createSqlComments())
        const cms = await this.db.dexie.comments.toArray()
        for (const c of cms) {
            db.exec(`insert into comments (content, created) values ('${c.content}',${c.created});`)
        }
    }
    #createSqlComments() { return `
create table if not exists comments (
  id integer primary key not null,
  content text not null,
  created integer not null
);`
    }
}
