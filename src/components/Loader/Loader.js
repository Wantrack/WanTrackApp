import ClipLoader from "react-spinners/ClipLoader";

const Loader = (props) => {
  return (
    props.active && (
      <div className="loaderclass">
        <div className="loaderclassChild">          
          <ClipLoader size={100} color="#cb0c9f" />
          <strong>{props.text}</strong>
        </div>        
      </div>
    )
  );
};
export default Loader;