import React from 'react';

interface ConfirmDeleteModalProps {
    itemName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    itemName,
    onConfirm,
    onCancel
}) => {
    return (
        <div className="lib-modal-overlay">
            <div className="lib-modal">
                <h2>Confirmar Eliminación</h2>
                <p>¿Estás seguro de que deseas eliminar {itemName}?</p>
                <div className="lib-form-actions">
                    <button onClick={onCancel}>Cancelar</button>
                    <button
                        onClick={onConfirm}
                        className="lib-delete-btn"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;