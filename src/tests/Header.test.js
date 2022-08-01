import { render, screen } from "@testing-library/react";
import Header from '../components/Header'

const props = {
  showMenu: true,
  handleIriDownload: jest.fn(),
  handleUpload: jest.fn()
};

test("should render Header", () => {
  render(<Header {...props}/>);
  const titleElement = screen.getByText(/OwlParser: A Web Tool for Parsing and Querying SRM-based Ontology/i);
  expect(titleElement).toBeInTheDocument();
});
/*
test("should render menu buttons", () => {
  render(<Header {...props}/>);
  const menuElement = screen.findAllByLabelText("Load ontology");
  expect(menuElement).toBeVisible();
})
 */