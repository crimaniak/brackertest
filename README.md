# brackertest
Selenium usage example with JUnit

In this project we have two copies of the site we want to refactor and JUnit test for regression testing

In the origin directory there original page saved and in the copy directory is copy to be refactored. 
Run run_test_site.bat file to start two copies of http-server (use *npm install --global http-server* command to install it)
Original page will be available on address http://localhost:8086 and copy as http://localhost:8088

Then run **RefactoringRegressionTest** class as JUnit test

For the current moment, Firefox is used to run test. Edit **debug.properties** file to change this.
