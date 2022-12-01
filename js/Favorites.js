export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`

        return fetch(endpoint).then(data => data.json()).then(({ login, name, public_repos, followers }) => ({
            login,
            name,
            public_repos,
            followers
        }))
    }
}
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
        this.onAdd()
        this.save()
                
    }
    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }
   
    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)
            if (userExists) {
                throw new Error('Usuário já cadastrado')
            }

            const user = await GithubUser.search(username)
            if (user.login == undefined) {
                throw new Error('Usuário não encontrado.')
            }
            this.entries = [user, ...this.entries]
            this.update()
            this.save()
        } catch (error) {
            alert(error.message)
        }

    }
    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
        this.update()
    }
    delete(user) {
        const filteredEntries = this.entries.filter((entry) => entry.login !== user.login)
        this.entries = filteredEntries
        this.update()
        this.save()
    }
 
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        this.update()
        
        
    }
    update() {
        this.tbody = this.root.querySelector('table tbody')
        this.emptyState()
        this.removeAllTr()

        this.entries.forEach((user) => {
            const row = this.createRow()
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem do usuário ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = `/${user.login}`
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            row.querySelector('.remover').onclick = () => {
                const isOk = confirm('Deletar esse usuário?')
                if (isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => {
            tr.remove()
        })
    }
    createRow() {
        const tr = document.createElement('tr')
        tr.innerHTML = `<td class="user">
                            <img src="https://github.com/maykbrito.png" alt="Imagem do usuário Mayk Brito">
                            <a href="https://github.com/maykbrito" target="_blank">
                                <p>Mayk Brito</p>
                                <span>/maykbrito</span>
                            </a>
                        </td>
                        <td class = "repositories">123</td>
                        <td class = "followers" >1234</td>
                        <td class="remover"><a href="#">Remover</a></td>
                        `
        return tr

    }
    onAdd() {
        const buttonAdd = this.root.querySelector(".search button")
        buttonAdd.onclick = () => {
            const { value } = this.root.querySelector(".search input")
            this.add(value)
        }

    }
    emptyState() {
        if (this.entries.length === 0) {
            this.root.querySelector('.emptyState').classList.remove('hide')
        } else {
            this.root.querySelector('.emptyState').classList.add('hide')
        }
    }
   
}
