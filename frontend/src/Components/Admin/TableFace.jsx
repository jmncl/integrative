const TableFace = ({ image, title, note }) => (
    <span className="table-face">
        <img src={image || '/images/no-photo.svg'} alt="" />
        <span>
            <strong>{title}</strong>
            {note ? <small>{note}</small> : null}
        </span>
    </span>
)

export default TableFace
