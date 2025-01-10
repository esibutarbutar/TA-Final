async function getUserSession() {
  try {
    const response = await fetch("http://localhost:3000/api/session");
    if (!response.ok) throw new Error("Gagal memuat data session");

    const sessionData = await response.json();
    console.log("Data session pengguna:", sessionData);

    return sessionData.nip;
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal memuat data session.");
  }
}

async function fetchKelasList() {
  try {
    const nip = await getUserSession();
    if (!nip) throw new Error("NIP pengguna tidak ditemukan.");

    const response = await fetch("http://localhost:3000/api/kelas");
    if (!response.ok) throw new Error("Gagal memuat daftar kelas");

    const data = await response.json();
    console.log("Daftar kelas:", data);

    const filteredKelas = data.filter(kelas => kelas.nip === nip);
    console.log("Kelas yang dikelola oleh pengguna:", filteredKelas);

    return filteredKelas;
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal memuat daftar kelas.");
  }
}

async function fetchKelasData(kelasId) {
  try {
    const response = await fetch(`http://localhost:3000/api/kelas/${kelasId}`);
    if (!response.ok) throw new Error("Gagal memuat data kelas");

    const kelasData = await response.json();
    console.log("Data kelas:", kelasData);

    if (kelasData.siswa && kelasData.siswa.length > 0) {
      displayAbsensi(kelasData.siswa);
    } else {
      console.log("Tidak ada siswa yang terdaftar di kelas ini.");
      alert("Tidak ada siswa yang terdaftar di kelas ini.");
    }

    displayKelasHeader(kelasData);
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal memuat data kelas.");
  }
}

async function displayKelasHeader(kelasData) {
  const kelasHeader = document.getElementById('kelas-header');
  kelasHeader.innerHTML = ''; // Hapus isi sebelumnya

  if (!kelasData) {
    console.error('Data kelas tidak tersedia.');
    return;
  }

  const kelasInfo = document.createElement('p');
  kelasInfo.className = 'kelas';
  kelasInfo.textContent = `Kelas: ${kelasData.nama_kelas || 'Tidak Tersedia'}`;

  const waliKelasInfo = document.createElement('p');
  waliKelasInfo.className = 'wali';
  waliKelasInfo.textContent = `Wali Kelas: ${kelasData.nama_pegawai || 'Tidak Tersedia'}`;

  const dateLabel = document.createElement('label');
  dateLabel.className = 'kalender';
  dateLabel.setAttribute('for', 'attendance-date');

  const labelText = document.createTextNode('Pilih Tanggal: ');
  dateLabel.appendChild(labelText);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'attendance-date';
  dateInput.name = 'attendance-date';
  dateInput.value = new Date().toISOString().split('T')[0];
  dateInput.className = 'kalenderBox';

  dateLabel.appendChild(dateInput);
  document.body.appendChild(dateLabel);

  // Add event listener after the element is created
  dateInput.addEventListener('change', async () => {
    const selectedDate = dateInput.value;
    await fetchAbsensiData(kelasData.id, selectedDate);
  });

  const academicYearInfo = document.createElement('p');
  academicYearInfo.className = 'tahun';

  const semesterInfo = document.createElement('p');
  semesterInfo.className = 'semester';

  const tahunAjaranId = kelasData.id_tahun_ajaran;
  if (!tahunAjaranId) {
    console.error('ID Tahun Ajaran tidak tersedia di kelasData:', kelasData);
    academicYearInfo.textContent = 'Tahun Ajaran Tidak Tersedia';
    semesterInfo.textContent = 'Semester Tidak Tersedia';
  } else {
    try {
      const tahunAjaranResponse = await fetch(`/api/tahun-ajaran/${tahunAjaranId}`);
      if (tahunAjaranResponse.ok) {
        const tahunAjaranData = await tahunAjaranResponse.json();
        academicYearInfo.textContent = `Tahun Ajaran: ${tahunAjaranData.nama_tahun_ajaran}`;
        semesterInfo.textContent = `Semester: ${tahunAjaranData.semester}`;
      } else {
        console.error('Gagal mendapatkan Tahun Ajaran:', tahunAjaranResponse.statusText);
        academicYearInfo.textContent = 'Tahun Ajaran Tidak Ditemukan';
        semesterInfo.textContent = 'Semester Tidak Ditemukan';
      }
    } catch (error) {
      console.error('Error fetching Tahun Ajaran:', error);
      academicYearInfo.textContent = 'Gagal memuat Tahun Ajaran';
      semesterInfo.textContent = 'Gagal memuat Semester';
    }
  }

  // Tambahkan elemen ke dalam header
  kelasHeader.appendChild(kelasInfo);
  kelasHeader.appendChild(waliKelasInfo);
  kelasHeader.appendChild(semesterInfo);
  kelasHeader.appendChild(academicYearInfo);
  kelasHeader.appendChild(dateLabel);
}



// fungsi untuk memfilter sesuai tanggal yang dipilih di kalender
function displayAbsensiData(absensiData) {
  const absensiContainer = document.getElementById('absensi-container');
  absensiContainer.innerHTML = '';

  if (absensiData.length === 0) {
    absensiContainer.textContent = 'Tidak ada data absensi untuk tanggal ini.';
    return;
  }

  const table = document.createElement('table');
  const headerRow = document.createElement('tr');

  const headers = ['Nama Siswa', 'Status Absensi'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  absensiData.forEach(absensi => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = absensi.nama_siswa;

    const statusCell = document.createElement('td');
    statusCell.textContent = absensi.status;

    row.appendChild(nameCell);
    row.appendChild(statusCell);
    table.appendChild(row);
  });

  absensiContainer.appendChild(table);
}


function displayAbsensi(siswaList) {
  const tableBody = document.getElementById('siswa-tbody-absensi');
  tableBody.innerHTML = '';

  siswaList.forEach((siswa, index) => {
    const row = document.createElement('tr');

    // Kolom No
    const noCell = document.createElement('td');
    noCell.textContent = index + 1;
    row.appendChild(noCell);

    // Kolom Nama
    const namaCell = document.createElement('td');
    namaCell.textContent = siswa.nama_siswa;
    row.appendChild(namaCell);

    // Kolom NISN
    const nisnCell = document.createElement('td');
    nisnCell.textContent = siswa.nisn;
    row.appendChild(nisnCell);

    // Kolom Hadir
    const hadirCell = document.createElement('td');
    hadirCell.innerHTML = `
          <input type="checkbox" name="absensi[${siswa.nisn}][hadir]" class="hadir-checkbox" ${siswa.hadir ? 'checked' : ''} ${siswa.hadir !== null ? 'disabled' : ''}>
      `;
    row.appendChild(hadirCell);

    // Kolom Izin
    const izinCell = document.createElement('td');
    izinCell.innerHTML = `
          <input type="checkbox" name="absensi[${siswa.nisn}][izin]" class="izin-checkbox" ${siswa.izin ? 'checked' : ''} ${siswa.izin !== null ? 'disabled' : ''}>
      `;
    row.appendChild(izinCell);

    // Kolom Sakit
    const sakitCell = document.createElement('td');
    sakitCell.innerHTML = `
          <input type="checkbox" name="absensi[${siswa.nisn}][sakit]" class="sakit-checkbox" ${siswa.sakit ? 'checked' : ''} ${siswa.sakit !== null ? 'disabled' : ''}>
      `;
    row.appendChild(sakitCell);

    // Kolom Alpa
    const alpaCell = document.createElement('td');
    alpaCell.innerHTML = `
          <input type="checkbox" name="absensi[${siswa.nisn}][alpa]" class="alpa-checkbox" ${siswa.alpa ? 'checked' : ''} ${siswa.alpa !== null ? 'disabled' : ''}>
      `;
    row.appendChild(alpaCell);

    // Tambahkan baris ke tabel
    tableBody.appendChild(row);
  });

  // Logika tambahan untuk "Select All"
  // Fungsi untuk memeriksa apakah semua checkbox terpilih
  function checkAllSelected(status) {
    const checkboxes = document.querySelectorAll(`.${status}-checkbox`);
    const selectAllCheckbox = document.getElementById(`select-all-${status}`);
    if (!selectAllCheckbox) return;

    // Periksa apakah semua checkbox sudah tercentang
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
    selectAllCheckbox.checked = allSelected;

    // Nonaktifkan "Select All" jika tidak ada checkbox yang terpilih
    selectAllCheckbox.disabled = !checkboxes.length;
  }

  // Menambahkan event listener pada setiap checkbox status
  ['hadir', 'izin', 'sakit', 'alpa'].forEach(status => {
    const checkboxes = document.querySelectorAll(`.${status}-checkbox`);
    
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => checkAllSelected(status));
    });

    // Menambahkan event listener pada checkbox "Select All"
    const selectAllCheckbox = document.getElementById(`select-all-${status}`);
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        checkboxes.forEach(checkbox => {
          checkbox.checked = isChecked;
        });
      });
    }
  });
}

// const uniqueAbsensiData = uniqueAbsensiData.filter((value, index, self) =>
//     index === self.findIndex((t) => (
//         t.nisn === value.nisn && t.status === value.status
//     ))
// );

const saveButton = document.getElementById("save-button");

saveButton.addEventListener("click", async () => {
  const mode = saveButton.getAttribute("data-mode");
  const id_kelas = await getIdKelas();

  if (!id_kelas) {
    Swal.fire({
      icon: 'error',
      title: 'ID Kelas tidak ditemukan!',
      text: 'Silakan periksa kembali data kelas.',
    });
    return;
  }

  // Ambil tanggal yang dipilih
  const selectedDate = document.getElementById("attendance-date").value;

  // Cek apakah tanggal yang dipilih lebih besar dari hari ini
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const selectedDateObj = new Date(selectedDate);

  // Cek apakah tanggal yang dipilih lebih dari 7 hari yang lalu
  if (selectedDateObj > today) {
    Swal.fire({
      icon: 'error',
      title: 'Tanggal tidak valid!',
      text: 'Anda tidak dapat memilih tanggal di masa depan untuk absensi.',
    });
    return;
  }

  if (selectedDateObj < sevenDaysAgo) {
    Swal.fire({
      icon: 'error',
      title: 'Tanggal tidak valid!',
      text: 'Anda hanya bisa mengedit absensi dalam rentang 7 hari terakhir.',
    });
    return;
  }

  const date = selectedDate; // Gunakan tanggal yang dipilih

  try {
    if (mode === 'edit') {
      // Aktifkan checkbox untuk edit
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
      });
      saveButton.textContent = "Simpan";
      saveButton.setAttribute("data-mode", "save");
    } else if (mode === 'save') {
      // Kumpulkan data absensi
      const absensiData = [];
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        if (checkbox.name && checkbox.name.includes('[') && checkbox.name.includes(']')) {
          const nisn = checkbox.name.split('[')[1].split(']')[0];
          const status = checkbox.value;
          absensiData.push({
            nisn: nisn,
            status: status,
            id_kelas: id_kelas,
            date: date
          });
        }
      });

      if (absensiData.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Tidak ada data absensi yang dipilih!',
          text: 'Silakan pilih data absensi terlebih dahulu.',
        });
        return;
      }

      // Hilangkan data duplikat
      const uniqueAbsensiData = removeDuplicateAbsensi(absensiData);

      // Simpan atau update absensi
      let attendanceResponse = await fetch("http://localhost:3000/api/save-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_kelas: id_kelas,
          date: date
        }),
      });

      if (!attendanceResponse.ok) {
        const errorDetails = await attendanceResponse.json();
        console.error("Error from save-attendance API:", errorDetails);
        throw new Error(errorDetails.message || "Gagal menyimpan data absensi kelas");
      }

      const attendanceResult = await attendanceResponse.json();
      const attendanceId = attendanceResult.id || attendanceResult.insertId;

      if (!attendanceId) {
        throw new Error("ID Absensi tidak ditemukan dalam response.");
      }

      // Simpan detail absensi
      const detailsResponse = await fetch("http://localhost:3000/api/save-attendance-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_kelas: id_kelas,
          date: date,
          absensiData: uniqueAbsensiData,
        }),
      });

      if (!detailsResponse.ok) {
        const errorDetails = await detailsResponse.json();
        console.error("Error from save-attendance-details API:", errorDetails);
        throw new Error(errorDetails.message || "Gagal menyimpan data detail absensi");
      }

      Swal.fire({
        icon: 'success',
        title: 'Data absensi berhasil disimpan!',
        text: 'Data absensi telah berhasil disimpan.',
        confirmButtonColor: '#004D40',
      });

      // Refresh data absensi
      fetchAbsensiData(id_kelas, date);

      // Kembali ke mode Edit
      saveButton.textContent = "Edit";
      saveButton.setAttribute("data-mode", "edit");
      
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal menyimpan data absensi!',
      text: 'Terjadi kesalahan dalam menyimpan data absensi.',
    });
  }
});
async function updateStatusAbsensi(absensiId, absensiData) {
  try {
    if (!absensiId || !Array.isArray(absensiData) || absensiData.length === 0) {
      throw new Error('Invalid absensiId or absensiData');
    }

    // menghapus data duplikat
    const uniqueAbsensiData = removeDuplicateAbsensi(absensiData);

    // data absensi untuk update
    const values = uniqueAbsensiData.map(item => [item.status, absensiId, item.nisn]);

    // memperbarui status absensi di database
    const [result] = await db.query(
      `
          UPDATE attendanceDetails
          SET status = ?
          WHERE id_attendance = ? AND nisn = ?
          `,
      values
    );

    // mengecek apakah ada baris yang terpengaruh
    if (result.affectedRows === 0) {
      throw new Error('No matching records found to update');
    }

    return { success: true, message: 'Attendance details updated successfully', result };
  } catch (error) {
    console.error('Error updating attendance details:', error);
    return { success: false, message: error.message, error };
  }
}

// fungsi untuk menghapus duplikasi data berdasarkan nisn
const removeDuplicateAbsensi = (data) => {
  const uniqueData = new Map();

  data.forEach(item => {
    if (!uniqueData.has(item.nisn)) {
      uniqueData.set(item.nisn, item);
    } else {
      uniqueData.set(item.nisn, item);
    }
  });

  // mengembalikan data yang sudah unik
  return Array.from(uniqueData.values());
};


async function fetchAbsensiData(kelasId, date) {
  console.log(`Fetching attendance data for kelasId=${kelasId}, date=${date}`);

  try {
    const response = await fetch(`http://localhost:3000/api/attendance-details?kelasId=${kelasId}&date=${date}`);
    if (!response.ok) throw new Error("Gagal memuat data absensi");

    const responseData = await response.json();
    const absensiData = responseData.attendanceDetails;

    console.log("Data absensi fetched:", absensiData);

    const tbody = document.getElementById('siswa-tbody-absensi');
    tbody.innerHTML = ''; // Clear previous data

    absensiData.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
              <td>${item.nama_siswa}</td>
              <td>${item.nisn}</td>
              <td>
                  <input type="checkbox" name="absensi[${item.nisn}][Hadir]" class="hadir-checkbox" value="Hadir" ${item.status === 'Hadir' ? 'checked' : ''} ${item.status ? 'disabled' : ''}>
              </td>
              <td>
                  <input type="checkbox" name="absensi[${item.nisn}][Izin]" class="izin-checkbox" value="Izin" ${item.status === 'Izin' ? 'checked' : ''} ${item.status ? 'disabled' : ''}>
              </td>
              <td>
                  <input type="checkbox" name="absensi[${item.nisn}][Sakit]" class="sakit-checkbox" value="Sakit" ${item.status === 'Sakit' ? 'checked' : ''} ${item.status ? 'disabled' : ''}>
              </td>
              <td>
                  <input type="checkbox" name="absensi[${item.nisn}][Alpa]" class="alpa-checkbox" value="Alpa" ${item.status === 'Alpa' ? 'checked' : ''} ${item.status ? 'disabled' : ''}>
              </td>
          `;
      tbody.appendChild(tr);
    });


  } catch (error) {
    console.error("Error saat memuat data absensi:", error);
    alert(`Gagal memuat data absensi: ${error.message}`);
  }
}

function initializeSelectAllLogic() {
  ['hadir', 'izin', 'sakit', 'alpa'].forEach(status => {
    const selectAllCheckbox = document.getElementById(`select-all-${status}`);
    
    // Event listener untuk checkbox "Select All"
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll(`.${status}-checkbox`);
        checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
        updateSelectAllStatus(status); // Update status "Select All"
      });
    }

    // Event listener untuk checkbox individu
    const checkboxes = document.querySelectorAll(`.${status}-checkbox`);
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        updateSelectAllStatus(status); // Update status "Select All"
      });
    });
  });
}
document.getElementById("save-button").addEventListener("click", function() {
  const mode = this.getAttribute("data-mode");

  if (mode === "save") {
  } else if (mode === "edit") {
    
    document.getElementById("cancel-button").style.display = "inline-block";  
    this.textContent = "Simpan Perubahan";
    this.setAttribute("data-mode", "save");
  }
});

document.getElementById("cancel-button").addEventListener("click", function() {
  const saveButton = document.getElementById("save-button");
  saveButton.textContent = "Edit";
  saveButton.setAttribute("data-mode", "edit");
  
  this.style.display = "none";  

});

// // Fungsi untuk logika "Select All"
// function initializeSelectAllLogic() {
//   ['hadir', 'izin', 'sakit', 'alpa'].forEach(status => {
//     const selectAllCheckbox = document.getElementById(`select-all-${status}`);
    
//     // Event listener untuk "Select All"
//     if (selectAllCheckbox) {
//       selectAllCheckbox.addEventListener('change', (e) => {
//         const checkboxes = document.querySelectorAll(`.${status}-checkbox`);
//         checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
//       });
//     }

//     // Tambahkan event listener untuk checkbox individual
//     const checkboxes = document.querySelectorAll(`.${status}-checkbox`);
//     checkboxes.forEach(checkbox => {
//       checkbox.addEventListener('change', () => {
//         // Periksa apakah semua checkbox sudah tercentang
//         const allChecked = [...checkboxes].every(checkbox => checkbox.checked);
        
//         // Jika semua checkbox tercentang, aktifkan "Select All", jika tidak non-aktifkan
//         selectAllCheckbox.checked = allChecked;
//         selectAllCheckbox.indeterminate = !allChecked && [...checkboxes].some(checkbox => checkbox.checked); // Indeterminate state
//       });
//     });
//   });
// }

document.addEventListener('DOMContentLoaded', () => {
  // Ambil kelasId dan date dari atribut data-* pada elemen
  const kelasInfoElement = document.getElementById('kelas-info');
  const kelasId = kelasInfoElement ? kelasInfoElement.getAttribute('data-kelas-id') : 1;
  const date = kelasInfoElement ? kelasInfoElement.getAttribute('data-date') : '2025-01-05';

  // Panggil fungsi fetchAbsensiData dengan kelasId dan date yang dinamis
  fetchAbsensiData(kelasId, date);
});


// // Menginisialisasi fungsionalitas "Select All" setelah render
// function initializeSelectAllLogic() {
//   ['hadir', 'izin', 'sakit', 'alpa'].forEach(status => {
//     const selectAllCheckbox = document.getElementById(`select-all-${status}`);
//     if (selectAllCheckbox) {
//       selectAllCheckbox.addEventListener('change', (e) => {
//         const checkboxes = document.querySelectorAll(`.${status}-checkbox`);
//         checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
//       });
//     }
//   });
// }


async function getIdKelas() {
  const kelasList = await fetchKelasList();
  if (kelasList && kelasList.length > 0) {
    return kelasList[0].id;
  }
  return null;
}

async function loadKelasData() {
  console.log("Fetching daftar kelas...");

  try {
    const kelasList = await fetchKelasList();

    if (Array.isArray(kelasList) && kelasList.length > 0) {
      const kelasId = kelasList[0].id;
      console.log("ID kelas yang dipilih:", kelasId);

      if (kelasId) {
        await fetchKelasData(kelasId);
        const todayDate = new Date().toLocaleDateString('en-CA');
        await fetchAbsensiData(kelasId, todayDate);
      } else {
        console.warn("ID kelas tidak valid.");
        alert("Tidak ada ID kelas yang ditemukan.");
      }
    } else {
      console.warn("Tidak ada data kelas tersedia.");
      alert("Tidak ada data kelas tersedia.");
    }
  } catch (error) {
    console.error("Error saat memuat data kelas:", error);
    alert("Gagal memuat data kelas: ${error.message}");
  }
}

document.addEventListener("DOMContentLoaded", loadKelasData);

document.addEventListener('DOMContentLoaded', () => {
  // menggunakan add.EventListener untuk mencari siswa
  document.getElementById('search-siswa').addEventListener('input', searchSiswa);
});

function searchSiswa() {
  const searchTerm = document.getElementById('search-siswa').value.toLowerCase();
  const rows = document.querySelectorAll('#siswa-tbody-absensi tr');
  const targetElement = document.getElementById('siswa-container');
  let hasMatch = false;

  rows.forEach(row => {
    const namaSiswa = row.cells[1].textContent.toLowerCase();
    const nisn = row.cells[2].textContent.toLowerCase();

    if (namaSiswa.includes(searchTerm) || nisn.includes(searchTerm)) {
      row.style.display = '';
      hasMatch = true;
    } else {
      row.style.display = 'none';
    }
  });

  // menampilkan pesan/keterangan jika data tidak ditemukan
  const notFoundMessage = document.getElementById('not-found-message');
  if (!hasMatch) {
    if (!notFoundMessage) {
      const message = document.createElement('p');
      message.id = 'not-found-message';
      message.textContent = 'Siswa tidak terdaftar di dalam kelas ini.';
      message.style.textAlign = 'center';
      message.style.fontStyle = 'italic';
      targetElement.appendChild(message);
    }
  } else {
    if (notFoundMessage) {
      notFoundMessage.remove();
    }
  }
}