import { useState } from 'react';
import ImageZoomModal from './ImageZoomModal';
import './ProductCard.css';

const ProductCard = ({ product, onClick }) => {
    const [showImageZoom, setShowImageZoom] = useState(false);

    const handleImageClick = (e) => {
        e.stopPropagation();
        setShowImageZoom(true);
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick(product);
        }
    };

    return (
        <>
            <div className="product-card" onClick={handleCardClick}>
                <div className="product-image" onClick={handleImageClick}>
                    <img src={product.imagen} alt={product.articulo} />
                </div>
                <div className="product-info">
                    <h3 className="product-title">{product.articulo}</h3>
                    <p className="product-description">{product.descripcion}</p>
                </div>
                <div className="product-footer">
                    <button className="btn btn-primary btn-sm">
                        Ver Detalles
                    </button>
                </div>
            </div>

            {showImageZoom && (
                <ImageZoomModal
                    imageUrl={product.imagen}
                    productName={product.articulo}
                    onClose={() => setShowImageZoom(false)}
                />
            )}
        </>
    );
};

export default ProductCard;
