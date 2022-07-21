window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    const db = new MyLogDb()
    const sqlFile = new Sqlite3DbFile()
    const downloader = new MyLogDownloader(db)
    const uploader = new MyLogUploader(db, sqlFile)
    document.getElementById('post').addEventListener('click', async(event) => {
        const content = document.getElementById('content').value
        if (!content) { alert('つぶやく内容をテキストエリアに入力してください。'); return }
        const now = Math.floor(new Date().getTime() / 1000)
        const insHtml = await db.insert(content, now)
        document.getElementById('post-list').innerHTML = insHtml + document.getElementById('post-list').innerHTML
        document.getElementById('content').value = ''
        document.getElementById('content').focus()
        if (sqlFile.db) {
        //if (document.getElementById('is-over-write').checked) {
            const path = document.getElementById('file-input').value
            const name = path.replace(/.*[\/\\]/, '');
            //sqlFile.read(name)
            //const res = sqlFile.db.exec(`select * from comments where created = (select MAX(created) from comments);`)
            sqlFile.db.exec(`insert into comments(content, created) values('${content}', ${now});`)
            const res = await sqlFile.write(name)
            if (res) { Toaster.toast(`ローカルファイルにも追記しました。: ${name}`) }
            //console.debug(sqlFile.file)
            //sqlFile.write(sqlFile.file.name)

            // 書き込み許可をしなくても実行されてしまう！
            //Toaster.toast(`ローカルファイルにも追記しました。: ${name}`)
        //}
        }
    })
    document.getElementById('download').addEventListener('click', async(event) => {
        await downloader.download()
    })
    document.getElementById('delete').addEventListener('click', async(event) => {
        const deletes = Array.from(document.querySelectorAll(`#post-list input[type=checkbox][name=delete]:checked`)).map(d=>parseInt(d.value))
        console.debug(deletes)
        //await db.delete(deletes.map(d=>parseInt(d.value)))
        await db.delete(deletes)
        document.getElementById('post-list').innerHTML = await db.toHtml()
        if (sqlFile.db) {
            const path = document.getElementById('file-input').value
            const name = path.replace(/.*[\/\\]/, '');
            sqlFile.db.exec(`BEGIN;`)
            for (const id of deletes) {
                sqlFile.db.exec(`delete from comments where id = ${id};`)
            }
            sqlFile.db.exec(`COMMIT;`)
            const res = await sqlFile.write(name)
            if (res) { Toaster.toast(`ローカルファイルからも削除しました。: ${name}`) }
        }
        /*
        if (0===deletes.length) {
            if (confirm('つぶやきをすべて削除します。\n本当によろしいですか？')) {
                await db.clear()
                document.getElementById('post-list').innerHTML = await db.toHtml()
                document.getElementById('content').focus()
            }
        } else { await db.delete() }
            for (const id of deletes.map(d=>d.value)) {
                await db.comments.delete()
            }
        }
        */
    })
    Loading.setup()
    uploader.setup()
    document.getElementById('post-list').innerHTML = await db.toHtml()
    document.getElementById('content').focus()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

