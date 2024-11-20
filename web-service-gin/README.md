# RESTful API dengan Go dan Gin
Proyek ini adalah tutorial sederhana untuk membuat RESTful API menggunakan bahasa Go dan framework **Gin**. API yang dibuat bertujuan untuk mengelola data album musik.

## Daftar Isi
1. [Persiapan Lingkungan](#persiapan-lingkungan)
2. [Struktur Data dan Inisialisasi Proyek](#struktur-data-dan-inisialisasi-proyek)
3. [Endpoint GET untuk Mengambil Semua Album](#endpoint-get-untuk-mengambil-semua-album)
4. [Endpoint POST untuk Menambahkan Album](#endpoint-post-untuk-menambahkan-album)
5. [Endpoint GET untuk Mengambil Album Berdasarkan ID](#endpoint-get-untuk-mengambil-album-berdasarkan-id)
6. [Cara Menjalankan Proyek](#cara-menjalankan-proyek)

## 1. Persiapan Lingkungan
### Prasyarat:
- **Go**: Pastikan Go versi 1.16 atau lebih baru sudah terinstal.
- **Gin Framework**: Akan otomatis diunduh saat menjalankan perintah `go get`.

## 2. Struktur Data dan Inisialisasi Proyek
### Langkah-langkah:
1. **Buat folder proyek**:
   ```bash
   mkdir web-service-gin
   cd web-service-gin
   ```

2. **Inisialisasi module Go**:
   ```bash
   go mod init example/web-service-gin
   ```

3. **Buat file `main.go`**:
   Tambahkan kode berikut ke dalam `main.go`:

   ```go
   package main

   import (
       "net/http"
       "github.com/gin-gonic/gin"
   )

   // album represents data about a record album.
   type album struct {
       ID     string  `json:"id"`
       Title  string  `json:"title"`
       Artist string  `json:"artist"`
       Price  float64 `json:"price"`
   }

   // albums slice to seed record album data.
   var albums = []album{
       {ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
       {ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
       {ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
   }

   func main() {
       router := gin.Default()
       router.GET("/albums", getAlbums)
       router.Run("localhost:8080")
   }
   ```

4. **Menambahkan Gin Framework**:
   Jalankan perintah berikut untuk menambahkan dependency Gin:
   ```bash
   go get .
   ```

## 3. Endpoint GET untuk Mengambil Semua Album
### Menambahkan Fungsi Handler
Tambahkan handler berikut di `main.go` untuk endpoint `GET /albums`:
```go
func getAlbums(c *gin.Context) {
    c.IndentedJSON(http.StatusOK, albums)
}
```
Fungsi ini mengembalikan semua data album dalam format JSON dengan status HTTP `200 OK`.

### Output yang Diharapkan
Jika server berjalan dengan baik dan setelah menjalankan perintah:
```bash
curl http://localhost:8080/albums
```
Respons JSON-nya akan seperti ini:

![alt text](<documentation/image.png>)

## 4. Endpoint POST untuk Menambahkan Album
### Menambahkan Endpoint Baru
Tambahkan handler berikut di `main.go` untuk endpoint `POST /albums`:
```go
func postAlbums(c *gin.Context) {
    var newAlbum album

    // Call BindJSON to bind the received JSON to newAlbum.
    if err := c.BindJSON(&newAlbum); err != nil {
        return
    }

    // Add the new album to the slice.
    albums = append(albums, newAlbum)
    c.IndentedJSON(http.StatusCreated, newAlbum)
}
```
Fungsi ini menambahkan album baru ke dalam data. JSON dari permintaan di-bind ke variabel `newAlbum`, lalu album tersebut ditambahkan ke slice `albums`. Jika berhasil, fungsi mengembalikan respons JSON dengan data album baru dan status `201 Created`.

Kemudian ubah `main` menjadi seperti berikut:
```go
func main() {
    router := gin.Default()
    router.GET("/albums", getAlbums)
    router.POST("/albums", postAlbums)
    router.Run("localhost:8080")
}
```

### Output yang Diharapkan
1. Jalankan perintah berikut untuk menambahkan album baru:
   ```bash
   curl -X POST http://localhost:8080/albums -H "Content-Type: application/json" -d "{\"id\":\"4\",\"title\":\"New Album\",\"artist\":\"New Artist\",\"price\":49.99}"
   ```
2. Respons JSON:

    ![alt text](<documentation/image-1.png>)

3. Verifikasi bahwa album baru berhasil ditambahkan:
   ```bash
   curl http://localhost:8080/albums
   ```
   Respons JSON akan menunjukkan data baru:
    ![alt text](<documentation/image-2.png>)

## **5. Endpoint GET untuk Mengambil Album Berdasarkan ID**

### **Menambahkan Endpoint Baru**
Tambahkan handler berikut di `main.go` untuk endpoint `GET /albums/:id`:
```go
func getAlbumByID(c *gin.Context) {
    id := c.Param("id")

    // Loop over the list of albums, looking for
    // an album whose ID value matches the parameter.
    for _, a := range albums {
        if a.ID == id {
            c.IndentedJSON(http.StatusOK, a)
            return
        }
    }
    c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album not found"})
}
```
Fungsi ini mencari album berdasarkan `id` yang diambil dari parameter URL (`/albums/:id`). Jika album dengan ID yang cocok ditemukan, data album dikembalikan dalam format JSON dengan status `200 OK`. Jika tidak ditemukan, fungsi mengembalikan pesan error dengan status `404 Not Found`.

Kemudian, ubah fungsi `main` untuk menambahkan rute baru:
```go
func main() {
    router := gin.Default()
    router.GET("/albums", getAlbums)
    router.POST("/albums", postAlbums)
    router.GET("/albums/:id", getAlbumByID) // Tambahkan endpoint ini
    router.Run("localhost:8080")
}
```

### **Output yang Diharapkan**
1. Jalankan server, lalu gunakan perintah berikut untuk mengambil album dengan ID tertentu, misalnya `2`:
   ```bash
   curl http://localhost:8080/albums/2
   ```
2. Respons JSON akan menampilkan data album:
    ![alt text](<documentation/image-3.png>)

3. Jika ID tidak ditemukan, respons JSON akan menampilkan pesan error:
    ![alt text](<documentation/image-4.png>)

## 6. Cara Menjalankan Proyek
1. **Jalankan server**:
   Pastikan Anda berada di direktori proyek dan jalankan:
   ```bash
   go run .
   ```

2. **Output di Terminal**:
   Jika server berjalan dengan baik, Anda akan melihat:
   ```
   [GIN-debug] Listening and serving HTTP on localhost:8080
   ```

3. **Akses API**, misal untuk **GET Semua Album**:
     ```bash
     curl http://localhost:8080/albums
     ```