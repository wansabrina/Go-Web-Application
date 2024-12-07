# CRUD Operations with GORM and SQLite

Proyek ini adalah implementasi sederhana operasi CRUD (Create, Read, Update, Delete) menggunakan **GORM**, sebuah ORM (Object Relational Mapping) untuk Golang, dengan **SQLite** sebagai database. Proyek ini menghasilkan file database SQLite bernama `test.db`.

## Daftar Isi
 
1. [Struktur Proyek](#struktur-proyek)  
2. [Penjelasan Kode](#penjelasan-kode)  
3. [Instalasi dan Penggunaan](#instalasi-dan-penggunaan)  

## Struktur Proyek

```
project/
├── main.go       # File utama program
└── test.db       # Database SQLite (dihasilkan setelah menjalankan program)
```

## Penjelasan Kode

Kode ini terdiri dari beberapa bagian utama:

### 1. **Import Library**
```go
import (
  "gorm.io/gorm"
  "gorm.io/driver/sqlite"
)
```
Mengimpor **GORM** sebagai ORM dan **SQLite** sebagai driver database.


### 2. **Definisi Model**
```go
type Product struct {
  gorm.Model
  Code  string
  Price uint
}
```
- Model `Product` merepresentasikan tabel `products` di database.
- `gorm.Model` menambahkan kolom bawaan seperti `id`, `created_at`, `updated_at`, dan `deleted_at`.


### 3. **Koneksi Database**
```go
db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
if err != nil {
  panic("failed to connect database")
}
```
- Membuka koneksi ke database SQLite bernama `test.db`.
- Jika file belum ada, SQLite akan otomatis membuat file baru.


### 4. **Migrasi Schema**
```go
db.AutoMigrate(&Product{})
```
- Membuat tabel `products` di database berdasarkan model `Product`.


### 5. **Operasi CRUD**
#### **Create**
```go
db.Create(&Product{Code: "D42", Price: 100})
```
- Menambahkan baris baru ke tabel `products` dengan `Code: "D42"` dan `Price: 100`.

#### **Read**
```go
db.First(&product, 1)
db.First(&product, "code = ?", "D42")
```
- Membaca data:
  - `db.First(&product, 1)` mencari produk berdasarkan primary key (`id = 1`).
  - `db.First(&product, "code = ?", "D42")` mencari produk dengan `code = "D42"`.

#### **Update**
```go
db.Model(&product).Update("Price", 200)
db.Model(&product).Updates(Product{Price: 200, Code: "F42"})
db.Model(&product).Updates(map[string]interface{}{"Price": 200, "Code": "F42"})
```
- Memperbarui data:
  - Baris pertama memperbarui hanya kolom `price` menjadi 200.
  - Baris kedua memperbarui kolom `price` dan `code`.
  - Baris ketiga menggunakan map untuk memperbarui kolom.

#### **Delete**
```go
db.Delete(&product, 1)
```
- Menghapus data secara soft delete dengan mengisi kolom `deleted_at`.


## Instalasi dan Penggunaan

1. **Kloning Repositori**  
   ```bash
   git clone https://github.com/wansabrina/Go-Web-Application.git
   cd Go-Web-Application/gorm
   ```

2. **Inisialisasi Dependency**  
   Pastikan sudah menginstal Go dan jalankan perintah berikut:
   ```bash
   go mod tidy
   ```

3. **Jalankan Program**  
   Eksekusi program menggunakan perintah:
   ```bash
   go run main.go
   ```

4. **Hasilkan Database**  
   Setelah program dijalankan, file database `test.db` akan dihasilkan di direktori proyek.
