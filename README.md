# Wiki Web Server

| Nama              | NRP        | Kelas  |
|-------------------|------------|--------|
| Wan Sabrina Mayzura | 5025211023 | PBKK D |

## Daftar Isi

1. [Deskripsi Proyek](#deskripsi-proyek)
2. [Task 1: Membuat Server Web](#task-1-membuat-server-web)
3. [Task 2: Redirect ke Front Page](#task-2-redirect-ke-front-page)
4. [Cara Kerja dan Tampilan Aplikasi](#cara-kerja-dan-tampilan-aplikasi)
5. [Cara Menjalankan Aplikasi Wiki](#cara-menjalankan-aplikasi-wiki)

Silakan gunakan tautan ini untuk navigasi langsung ke bagian yang diinginkan.
## Deskripsi Proyek

Wiki Web Server ini adalah aplikasi wiki sederhana yang dibuat menggunakan bahasa Go. Aplikasi ini memungkinkan pengguna untuk membuat, mengedit, dan melihat halaman wiki melalui server web.

## Task 1: Membuat Server Web

### 1. Instalasi dan Persiapan

- **Membuat Direktori Proyek**:
   ```bash
   $ mkdir gowiki
   $ cd gowiki
   ```

- **Buat File `wiki.go`**: Buat file `wiki.go` dan tambahkan kode dasar berikut:

   ```go
   package main

   import (
       "fmt"
       "html/template"
       "log"
       "net/http"
       "os"
       "regexp"
   )
   ```

- **Struktur Data Page**: Mendefinisikan struktur `Page` yang mewakili setiap halaman dalam wiki.

   ```go
   type Page struct {
       Title string
       Body  []byte
   }
   ```

   - `Title`: judul halaman.
   - `Body`: konten halaman, yang disimpan sebagai `[]byte` untuk memudahkan penulisan dan pembacaan file.

### 2. Menyimpan dan Memuat Halaman

- **Fungsi `save()`**: Fungsi ini menyimpan konten halaman ke dalam file teks.

  ```go
  func (p *Page) save() error {
      filename := "data/" + p.Title + ".txt"
      return os.WriteFile(filename, p.Body, 0600)
  }
  ```

- **Fungsi `loadPage()`**: Fungsi ini membaca konten halaman dari file teks.

  ```go
  func loadPage(title string) (*Page, error) {
      filename := "data/" + title + ".txt"
      body, err := os.ReadFile(filename)
      if err != nil {
          return nil, err
      }
      return &Page{Title: title, Body: body}, nil
  }
  ```

### 3. Menggunakan `net/http` untuk Menyajikan Halaman Wiki

Untuk menyajikan halaman wiki melalui web, digunakan beberapa handler untuk `view`, `edit`, dan `save`.

- **Handler `viewHandler`**
    
    Handler ini menampilkan halaman wiki berdasarkan judulnya. Jika halaman tidak ditemukan, pengguna akan diarahkan ke halaman edit untuk membuat halaman baru.

    ```go
    func viewHandler(w http.ResponseWriter, r *http.Request, title string) {
        p, err := loadPage(title)
        if err != nil {
            http.Redirect(w, r, "/edit/"+title, http.StatusFound)
            return
        }
        renderTemplate(w, "view", p)
    }
    ```

- **Handler `editHandler`**

    Handler ini menampilkan form untuk mengedit halaman. Jika halaman belum ada, maka handler akan membuat objek `Page` kosong.

    ```go
    func editHandler(w http.ResponseWriter, r *http.Request, title string) {
        p, err := loadPage(title)
        if err != nil {
            p = &Page{Title: title}
        }
        renderTemplate(w, "edit", p)
    }
    ```

- **Handler `saveHandler`**

    Handler ini menyimpan konten halaman yang dikirim melalui form edit, kemudian mengarahkan kembali ke halaman view.

    ```go
    func saveHandler(w http.ResponseWriter, r *http.Request, title string) {
        body := r.FormValue("body")
        p := &Page{Title: title, Body: []byte(body)}
        err := p.save()
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        http.Redirect(w, r, "/view/"+title, http.StatusFound)
    }
    ```

### 4. Helper Function

- **Fungsi `renderTemplate`**

    Untuk menghindari duplikasi kode dalam pengaturan template, dibuat fungsi `renderTemplate` yang menerima nama template dan data halaman untuk ditampilkan.

    ```go
    var templates = template.Must(template.ParseFiles("tmpl/edit.html", "tmpl/view.html"))

    func renderTemplate(w http.ResponseWriter, tmpl string, p *Page) {
        err := templates.ExecuteTemplate(w, tmpl+".html", p)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
        }
    }
    ```

    `renderTemplate` menggunakan `ExecuteTemplate` untuk menampilkan template tertentu (`view` atau `edit`) sesuai dengan argumen yang diberikan.

- **Fungsi `makeHandler`**

    Untuk mengurangi pengulangan kode dalam setiap handler, dibuat fungsi `makeHandler` yang memvalidasi judul halaman dan menangani error. `makeHandler` menerima fungsi handler (seperti `viewHandler`, `editHandler`, `saveHandler`) sebagai argumen.

    ```go
    var validPath = regexp.MustCompile("^/(edit|save|view)/([a-zA-Z0-9]+)$")

    func makeHandler(fn func(http.ResponseWriter, *http.Request, string)) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            m := validPath.FindStringSubmatch(r.URL.Path)
            if m == nil {
                http.NotFound(w, r)
                return
            }
            fn(w, r, m[2])
        }
    }
    ```

## Task 2: Redirect ke Front Page

Untuk menyelesaikan task kedua, dibuat beberapa perubahan pada `wiki.go`:

### 1. Menyimpan Template di `tmpl/` dan Data Halaman di `data/`
   - Mengubah path penyimpanan template ke `tmpl/edit.html` dan `tmpl/view.html`.
   - Menyimpan data halaman di `data/` dengan nama file sesuai judul halaman (`Title`).

        Sehingga struktur direktori akan terlihat seperti berikut:

        ```
        gowiki/
        ├── data/
        │   ├── FrontPage.txt
        ├── tmpl/
        │   ├── edit.html
        │   └── view.html
        └── wiki.go
        └── go.mod
        ```

### 2. Handler untuk Redirect ke `/view/FrontPage`
   - Menambahkan handler `rootHandler` untuk meredirect root URL (`/`) ke `/view/FrontPage`.

        ```go
        func rootHandler(w http.ResponseWriter, r *http.Request) {
            http.Redirect(w, r, "/view/FrontPage", http.StatusFound)
        }
        ```

   - Kemudian, mendaftarkan `rootHandler` di `main()`:
   
        ```go
        func main() {
            http.HandleFunc("/", rootHandler)
            http.HandleFunc("/view/", makeHandler(viewHandler))
            http.HandleFunc("/edit/", makeHandler(editHandler))
            http.HandleFunc("/save/", makeHandler(saveHandler))
            log.Fatal(http.ListenAndServe(":8080", nil))
        }
        ```

### 3. Interlinking Antar Halaman
   - Untuk menambahkan tautan otomatis antar halaman, ditambahkan fungsi `addLinks` yang menggunakan regex untuk mendeteksi teks dalam format `[PageName]` dan mengubahnya menjadi tautan `<a href="/view/PageName">PageName</a>`.

        ```go
        var linkPattern = regexp.MustCompile(`\[(\w+)\]`)

        func addLinks(text []byte) []byte {
            return linkPattern.ReplaceAllFunc(text, func(match []byte) []byte {
                pageName := match[1 : len(match)-1]
                return []byte(`<a href="/view/` + string(pageName) + `">` + string(pageName) + `</a>`)
            })
        }
        ```

   - Fungsi `addLinks` ini diterapkan pada konten halaman di `viewHandler`:

        ```go
        func viewHandler(w http.ResponseWriter, r *http.Request, title string) {
            p, err := loadPage(title)
            if err != nil {
                http.Redirect(w, r, "/edit/"+title, http.StatusFound)
                return
            }
            p.Body = addLinks(p.Body)
            renderTemplate(w, "view", p)
        }
        ```

Dengan perubahan ini, pengguna dapat membuat referensi antar halaman dengan format `[PageName]`, yang akan secara otomatis diubah menjadi tautan di halaman view.

## Cara Kerja dan Tampilan Aplikasi
1. **Front Page View**  
    ![alt text](documentation\image.png)
   Tampilan utama aplikasi wiki di mana pengguna dapat melihat konten dari halaman "FrontPage". Halaman ini juga menyediakan tombol "Edit" di pojok kanan bawah untuk memperbarui atau menambahkan konten, serta instruksi singkat tentang cara menggunakan aplikasi wiki.

2. **Edit Front Page** 
    ![alt text](documentation\image-1.png)
   Setelah mengklik tombol "Edit" pada "FrontPage", pengguna akan diarahkan ke halaman edit untuk menambahkan atau mengubah konten. Setelah selesai, pengguna dapat menyimpan perubahan dengan menekan tombol "Save" di pojok kanan bawah, lalu akan kembali ke halaman "Front Page" dengan konten yang diperbarui.

3. **Membuat Halaman Baru**  
    ![alt text](documentation\image-2.png)
   Pengguna dapat membuat halaman baru dengan mengetik judul halaman di URL setelah `/view/`. Misalnya, mengetik `/view/HalamanBaru` akan membuka halaman kosong dengan tombol "Edit" untuk menambahkan konten pertama. 
   ![alt text](documentation\image-3.png)
   Setelah penyimpanan, pengguna akan diarahkan kembali ke tampilan view dengan konten halaman baru tersebut.

### Cara Menjalankan Aplikasi Wiki

1. **Clone Repository**
   ```bash
   git clone https://github.com/wansabrina/Go-Web-Application.git
   cd Go-Web-Application/gowiki
   ```

2. **Build Program**
   Pastikan berada di direktori proyek, kemudian jalankan perintah berikut untuk membangun program:
   ```bash
   go run wiki.go
   ```

3. **Akses Aplikasi di Browser**
   Buka browser Anda dan akses alamat berikut:
   ```
   http://localhost:8080/view/FrontPage
   ```
   Setelah diakses, dapat dilihat halaman utama wiki dan mulai mengedit atau membuat halaman baru.
