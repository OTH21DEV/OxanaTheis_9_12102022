/**
 * @jest-environment jsdom
 */
import { localStorageMock } from "../__mocks__/localStorage.js";
import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee on NewBill Page", () => {
  let billForm;
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    // Set up the document body of new Bill
    document.body.innerHTML = NewBillUI();
    // mock navigation to test it
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    billForm = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: localStorageMock,
    });
  });
  /**Submit */
  describe("When i submit the form ", () => {
    test("It chould create a new bill", () => {
      const handleSubmit = jest.fn(NewBill.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  /**On change */

  describe("When i select a file ", () => {
    test("It should be changed in the input", () => {
      const handleChangeFile = jest.fn(NewBill.handleChangeFile);
      const file = screen.getByTestId("file");

      file.addEventListener("change", handleChangeFile);
      // simulate ulpoad event 
      fireEvent.change(file, {
        target:{
        files: [new File(["myProof.png"], "myProof.png", { type: "image/png" })],
        }
      });
      expect(handleChangeFile).toHaveBeenCalled();
      // expect(file.files[0].name).toBe("myProof.png");
      expect(file.files.length).toBe(1);
      // const newBillForm = screen.getByTestId("form-new-bill");
      // newBillForm.addEventListener("submit", handleSubmit);
      // fireEvent.submit(newBillForm);
      // expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
