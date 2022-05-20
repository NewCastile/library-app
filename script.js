/** @format */

let myLibrary = readStorage() || []
const cardContent = document.querySelector(".card-content")
const forms = document.querySelectorAll(".add-book-form")
const bookList = document.querySelector(".book-list")
const bookItems = document.querySelector(".rendered-list")
const goBackButtons = document.querySelectorAll(".go-back-btn")
const overlay = document.querySelector(".bg-overlay")

window.addEventListener("load", function (e) {
	if (!sessionStorage.getItem("LIBRARY")) {
		let firstBook = new Book(
			"Eloquent JavaScript",
			"Marijn Haverbeke",
			"448",
			"Read"
		)
		myLibrary.push(firstBook)
		render()
		save()
	} else if (sessionStorage.getItem("LIBRARY")) {
		render()
	}
})

function readStorage() {
	if (!sessionStorage.getItem("LIBRARY")) return false
	if (JSON.parse(sessionStorage.getItem("LIBRARY")).length == 0) return false
	let currentStorage = JSON.parse(sessionStorage.getItem("LIBRARY")).map(
		(object) => {
			const { title, author, pages, status, id } = object
			const book = new Book(title, author, pages, status, id)
			return book
		}
	)
	return currentStorage
}

function save() {
	sessionStorage.setItem("LIBRARY", JSON.stringify(myLibrary))
}

function render() {
	bookList.innerHTML = ""
	bookItems.innerHTML = ""
	myLibrary.forEach((book) => {
		bookList.appendChild(createBook(book))
		createItem(book)
	})
}

HTMLElement.prototype.show = function () {
	this.style.display = "flex"
}

HTMLElement.prototype.hide = function () {
	this.style.display = "none"
}

HTMLFormElement.prototype.close = function () {
	this.reset()
	this.hide()
	if (this.classList.contains("pop-up-form"))
		return overlay.classList.toggle("active")
	bookItems.parentElement.show()
}

function Book(title, author, pages, status, id) {
	this.author = author
	this.pages = pages
	this.status = status
	this.title = title
	this.id = id || this.generateId()
}

Book.prototype.toggleStatus = function () {
	if (this.status == "Read") return (this.status = "Not Read")
	return (this.status = "Read")
}

Book.prototype.generateId = function () {
	if (sessionStorage.getItem("LIBRARY") === null || undefined) return 1
	if (JSON.parse(sessionStorage.getItem("LIBRARY")).length === 0) return 1
	const bookList = JSON.parse(sessionStorage.getItem("LIBRARY"))
	const lastBook = bookList[bookList.length - 1]
	const id = parseInt(lastBook.id) + 1
	return id
}

function createBook(book) {
	const div = document.createElement("div")
	div.classList.add("book")
	;[
		div.dataset.title,
		div.dataset.author,
		div.dataset.pages,
		div.dataset.status,
		div.dataset.id,
	] = Object.values(book)
	const info = bookInfo(book)
	const status = bookStatus(book.status)
	info.appendChild(status)
	div.appendChild(info)
	return div
}

function bookInfo(book) {
	const div = document.createElement("div")
	div.classList.add("info")
	div.innerHTML = `
		<div>
			<p>Title</p>
			<p>${book.title}</p>
		</div>
		<div>
			<p>Author</p>
			<p>${book.author}</p>
		</div>
		<div>
			<p>Pages</p>
			<p>${book.pages}</p>
		</div>
	`
	return div
}

function bookStatus(status) {
	const div = document.createElement("div")
	if (status == "Read") {
		div.innerHTML = `
		<button class="btn status-btn read"><i class="icon fas fa-eye"></i></button>
		<button class="btn delete-btn"><i class="icon fas fa-trash-alt"></i></button>`
		return div
	}
	div.innerHTML = `
	<button class="btn status-btn not-read"><i class="icon fas fa-eye-slash"></i></button>
	<button class="btn delete-btn"><i class="icon fas fa-trash-alt"></i></button>`
	return div
}

function _delete(book) {
	book.parentElement.remove()
	removeItem(parseInt(book.parentElement.dataset.id))
}

function createItem(book) {
	const item = document.createElement("li")
	item.innerText = `${book.title}`
	bookItems.appendChild(item)
}

function removeItem(id) {
	bookItems.innerHTML = ""
	myLibrary = myLibrary.filter((book) => book.id !== id)
	myLibrary.forEach((book) => {
		createItem(book)
	})
}

function isEmptyString(element) {
	return element === ""
}

function toggleStatusBtn(button) {
	if (button.classList.contains("read")) {
		button.classList.replace("read", "not-read")
		button.innerHTML = '<i class="icon fas fa-eye-slash"></i>'
	} else if (button.classList.contains("not-read")) {
		button.classList.replace("not-read", "read")
		button.innerHTML = '<i class="icon fas fa-eye"></i>'
	}
}

function getFormValues(form) {
	let inputs = form.elements
	inputs = Array.from(inputs)
	inputs = inputs.filter((input) => input.type != "submit")
	inputs = inputs.map((input) => input.value)
	return inputs
}

forms.forEach((form) => {
	form.addEventListener("submit", function (e) {
		e.preventDefault()
		let values = getFormValues(form)
		if ([...values].some(isEmptyString)) {
			return alert("Missing Fields")
		}
		const book = new Book(...values)
		myLibrary.push(book)
		save()
		render()
		form.close()
	})
})

goBackButtons.forEach((button) => {
	button.addEventListener("click", function (e) {
		e.preventDefault()
		const form = document.querySelector(button.dataset.targetForm)
		form.close()
	})
})

cardContent.addEventListener("click", function (e) {
	if (e.target.classList.contains("add-book-btn")) {
		const form = document.querySelector(e.target.dataset.targetForm)
		form.show()
		bookItems.parentElement.hide()
	}
})

document.querySelector(".book-list").addEventListener("click", function (e) {
	e.preventDefault()
	if (e.target.classList.contains("delete-btn")) {
		const book = e.target.parentElement.parentElement
		_delete(book)
		save()
		render()
	} else if (e.target.classList.contains("status-btn")) {
		const book = e.target.parentElement.parentElement
		const id = parseInt(book.dataset.id)
		myLibrary.forEach((book) => {
			if (book.id === id) {
				book.toggleStatus()
			}
		})
		save()
		toggleStatusBtn(e.target)
	}
})

document.querySelector(".pop-up-btn").addEventListener("click", function (e) {
	e.preventDefault
	const form = document.querySelector(e.target.dataset.targetForm)
	form.show()
	overlay.classList.toggle("active")
})
