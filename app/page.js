"use client"; // this is a client component 👈🏽
import React, { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState('');

  const itemsPerPage = 10;

  const folders = useMemo(() => {
    const foldersSet = new Set();
    data.forEach(item => foldersSet.add(item.Carpeta));
    return Array.from(foldersSet);
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('facturas.xlsx', { responseType: 'arraybuffer' });
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        setData(jsonData);
      };
      reader.readAsArrayBuffer(new Blob([response.data]));
    };

    fetchData();
  }, []);

  const normalizeNumber = (number) => {
    return number.replace(/\./g, '').replace(/,/g, '.');
  };

  const normalizeText = (text) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const matchesSearch = (item, search) => {
    const searchNormalized = normalizeText(search);

    for (let key in item) {
      if (typeof item[key] === 'string' && normalizeText(item[key]).includes(searchNormalized)) {
        return true;
      }
    }

    if (typeof item['Descripción'] === 'string' && normalizeNumber(item['Descripción']).includes(normalizeNumber(search))) {
      return true;
    }

    return false;
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (selectedFolder && item.Carpeta !== selectedFolder) {
        return false;
      }
      return matchesSearch(item, search);
    });
  }, [data, search, selectedFolder]);

  const currentData = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const clearSelection = () => {
    setSearch('');
    setSelectedFolder('');
    setCurrentPage(0);
  };

  return (
    <div className="container">
      <nav className="navbar navbar-light bg-light mb-3">
        <a className="navbar-brand" href="#">
          <img src="https://alaska-cool.com/wp-content/webp-express/webp-images/uploads/2019/03/logo-retina.png.webp" alt="Logo" className="d-inline-block align-top" style={{ height: '40px' }} />
        </a>
      </nav>


      <div className="row justify-content-center mb-3">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        <div className="col-12 col-sm-8 col-md-6 col-lg-4 mb-2">
          <select
            className="form-control"
            value={selectedFolder}
            onChange={e => {
              setSelectedFolder(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="">Selecciona una carpeta</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <Button className="btn btn-primary w-100" onClick={clearSelection}>Limpiar</Button>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5">
        {currentData.map((item, i) => (
          <div className="col mb-3" key={i}>
            <Card className="h-100 d-flex align-items-center justify-content-center" onClick={() => {
              setSelectedImage(`${item.Carpeta}/${item.Imagen}`);
              setModalOpen(true);
            }}>
              <Card.Img
                as={LazyLoadImage}
                variant="top"
                src={item.Carpeta.replace("ESCANER", "Thumbnails") + '/' + item.Imagen}
                alt={item.Imagen}
                effect="blur"
                style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "250px" }}
              />

              <Card.Footer>
                <small className="text-muted">{item.Carpeta}</small>
              </Card.Footer>
            </Card>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-end mb-3">
        <ReactPaginate
          previousLabel={'anterior'}
          nextLabel={'siguiente'}
          pageCount={Math.ceil(filteredData.length / itemsPerPage)}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          containerClassName={'pagination'}
          previousLinkClassName={'pagination__link'}
          nextLinkClassName={'pagination__link'}
          disabledClassName={'pagination__link--disabled'}
          activeClassName={'pagination__link--active'}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
        />
      </div>

      <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Body>
          {selectedImage && (
            <ReactPanZoom
              image={`${selectedImage}`}
              alt="Imagen de factura"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;

