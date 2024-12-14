# Akses Database Relasional dengan Go

Pada folder ini akan ditampilkan tutorial Dasar MySQL dengan Go

## Daftar Isi
1. [Prasyarat](#prasyarat)
2. [Langkah-langkah Setup MySQL, Membuat Database, dan Tabel](#langkah-langkah-setup-mysql-membuat-database-dan-tabel)
3. [Penjelasan Kode](#penjelasan-kode)
   - [Inisialisasi Folder dan Module](#inisialisasi-folder-dan-module)
   - [Koneksi ke Database](#koneksi-ke-database)
   - [Query Data: Beberapa Baris](#query-data-beberapa-baris)
   - [Query Data: Satu Baris](#query-data-satu-baris)
   - [Menambahkan Data Baru](#menambahkan-data-baru)
4. [Menjalankan Program](#menjalankan-program)

## Prasyarat
- **MySQL**: Instalasi sistem manajemen basis data MySQL.
- **Go**: Instalasi bahasa pemrograman Go. [Petunjuk instalasi Go](https://golang.org/doc/install)

## Langkah-langkah Setup MySQL, Membuat Database, dan Tabel
1. **Masuk ke MySQL**:
    ```sh
    mysql -u root -p
    ```
    Masukkan password untuk pengguna root.

2. **Membuat Database**:
    ```sql
    CREATE DATABASE recordings;
    USE recordings;
    ```

3. **Membuat Tabel**:
    Buat file `create-tables.sql` dalam folder proyek untuk menyimpan skrip SQL berikut:
    ```sql
    DROP TABLE IF EXISTS album;
    CREATE TABLE album (
        id INT AUTO_INCREMENT NOT NULL,
        title VARCHAR(128) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        price DECIMAL(5,2) NOT NULL,
        PRIMARY KEY (id)
    );

    INSERT INTO album (title, artist, price) VALUES
        ('Blue Train', 'John Coltrane', 56.99),
        ('Giant Steps', 'John Coltrane', 63.99),
        ('Jeru', 'Gerry Mulligan', 17.99),
        ('Sarah Vaughan', 'Sarah Vaughan', 34.98);
    ```

4. **Jalankan Skrip SQL**:
    ```sh
    mysql> source /path/to/create-tables.sql
    ```

5. **Verifikasi Tabel**:
    ```sql
    SELECT * FROM album;
    ```

## Penjelasan Kode

### Inisialisasi Folder dan Module
1. Buat folder `data-access` untuk kode proyek.
2. Buat module Go:
    ```sh
    go mod init example/data-access
    ```

### Koneksi ke Database
Kode berikut di `main.go` menangkap properti koneksi yang diperlukan untuk terhubung ke database MySQL menggunakan Go. Konfigurasi ini mencakup informasi pengguna, password, alamat server, dan nama database. Pada contoh ini, informasi username dan password diambil dari environment variables `DBUSER` dan `DBPASS` untuk keamanan.

```go
package main

import (
    "database/sql"
    "fmt"
    "log"
    "os"
    "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func main() {
    cfg := mysql.Config{
        User:   os.Getenv("DBUSER"),    // Mengambil username dari environment variable
        Passwd: os.Getenv("DBPASS"),    // Mengambil password dari environment variable
        Net:    "tcp",                  // Menggunakan koneksi TCP
        Addr:   "127.0.0.1:3306",       // Alamat database MySQL
        DBName: "recordings",           // Nama database
    }

    var err error
    db, err = sql.Open("mysql", cfg.FormatDSN())
    if err != nil {
        log.Fatal(err)                   // Jika ada kesalahan saat membuka koneksi, program berhenti
    }

    pingErr := db.Ping()                 // Mengecek apakah koneksi ke database berhasil
    if pingErr != nil {
        log.Fatal(pingErr)               // Jika gagal, program akan berhenti dan menampilkan error
    }
    fmt.Println("Connected!")            // Menampilkan pesan jika koneksi berhasil
}
```

### Query Data: Beberapa Baris
Fungsi `albumsByArtist` digunakan untuk mengambil beberapa baris data dari tabel `album` berdasarkan nama artis tertentu. Proses ini mencakup eksekusi query, iterasi melalui hasil yang dikembalikan, dan pemetaan data dari setiap baris ke struktur `Album`. Setiap baris akan ditambahkan ke dalam slice `albums` yang nantinya akan dikembalikan sebagai hasil.

```go
func albumsByArtist(name string) ([]Album, error) {
    var albums []Album                       // Menyimpan hasil query dalam slice albums
    rows, err := db.Query("SELECT * FROM album WHERE artist = ?", name) 
    if err != nil {
        return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)  // Mengembalikan error jika query gagal
    }
    defer rows.Close()                       // Menutup hasil query setelah fungsi selesai

    for rows.Next() {                        // Mengiterasi setiap baris hasil query
        var alb Album
        if err := rows.Scan(&alb.ID, &alb.Title, &alb.Artist, &alb.Price); err != nil {
            return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)  // Mengembalikan error jika scan gagal
        }
        albums = append(albums, alb)         // Menambahkan album ke slice
    }
    
    if err := rows.Err(); err != nil {
        return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)  // Mengembalikan error jika ada kesalahan iterasi
    }
    return albums, nil                       // Mengembalikan slice albums
}
```

### Query Data: Satu Baris
Fungsi `albumByID` digunakan untuk mengambil satu baris data dari tabel `album` berdasarkan `id` yang diberikan. Fungsi ini memanfaatkan `QueryRow` karena hanya mengharapkan satu hasil. Hasil query akan dipetakan ke dalam struktur `Album`. Jika tidak ada data yang ditemukan, fungsi akan mengembalikan pesan error “no such album.”

```go
func albumByID(id int64) (Album, error) {
    var alb Album
    row := db.QueryRow("SELECT * FROM album WHERE id = ?", id)   // Menjalankan query untuk satu baris

    if err := row.Scan(&alb.ID, &alb.Title, &alb.Artist, &alb.Price); err != nil {
        if err == sql.ErrNoRows {
            return alb, fmt.Errorf("albumsById %d: no such album", id)  // Menampilkan pesan jika data tidak ditemukan
        }
        return alb, fmt.Errorf("albumsById %d: %v", id, err)     // Mengembalikan error jika ada masalah lain
    }
    return alb, nil                                              // Mengembalikan album jika berhasil ditemukan
}
```

### Menambahkan Data Baru
Fungsi `addAlbum` digunakan untuk menambahkan data baru ke tabel `album`. Dalam proses ini, SQL `INSERT` statement dieksekusi dengan menggunakan metode `Exec`. Fungsi ini menerima parameter berupa objek `Album` yang berisi informasi album yang akan ditambahkan. Setelah data ditambahkan, fungsi ini mengembalikan `ID` dari entri baru tersebut.

```go
func addAlbum(alb Album) (int64, error) {
    result, err := db.Exec("INSERT INTO album (title, artist, price) VALUES (?, ?, ?)", alb.Title, alb.Artist, alb.Price)
    if err != nil {
        return 0, fmt.Errorf("addAlbum: %v", err)    // Mengembalikan error jika insert gagal
    }
    id, err := result.LastInsertId()                 // Mendapatkan ID dari album yang baru ditambahkan
    if err != nil {
        return 0, fmt.Errorf("addAlbum: %v", err)    // Mengembalikan error jika pengambilan ID gagal
    }
    return id, nil                                   // Mengembalikan ID jika berhasil menambahkan album
}
```

Kode ini memungkinkan program untuk berinteraksi dengan database `recordings` pada tabel `album`, baik itu untuk mengambil data beberapa baris, satu baris tertentu, atau menambahkan data baru.

## Menjalankan Program
1. Atur environment variables `DBUSER` dan `DBPASS`:
    ```sh
    export DBUSER=newuser
    export DBPASS=newpassword
    ```
2. Jalankan program dari terminal:
    ```sh
    go run .
    ```
3. Hasil yang diharapkan adalah:

   ![alt text](<https://github.com/wansabrina/Go-Web-Application/raw/main/data-access/image.png>)