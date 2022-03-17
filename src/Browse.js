import Sidebar from "./components/Sidebar";
import Content from "./components/Content";
import { Link } from "react-router-dom";

const BrowsePage = ({ model }) => {
  return (
    <>
      {model === null ? (
        <>
          <h1>Error</h1>
          <p>No SRM ontology loaded!</p>
          <p>
            <Link to="/">Return to main page</Link>
          </p>
        </>
      ) : (
        <div className="wrapper">
          <Sidebar model={model} />
          <Content model={model} />
        </div>
      )}
    </>
  );
};

export default BrowsePage;
