using System.Threading;

using NUnit.Framework;

using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

namespace NodeWebkitTest
{
    public class CodeBlockTest : Test
    {
        [Test]
        public void T01_CreateEmptyCodeBlockTest()
        {
            // Create empty CBN.
            var search = driver.FindElement(By.Id("bottom-search"));
            search.SendKeys("code");
            Thread.Sleep(1000);
            search = driver.FindElement(By.Id("bottom-search"));
            search.SendKeys(Keys.Return);
            Thread.Sleep(1000);
            search = driver.FindElement(By.Id("bottom-search"));
            search.Clear();
            Thread.Sleep(1000);
            // Click on container to lose focus from code block
            var container = driver.FindElement(By.Id("top_container"));
            container.Click();
            Thread.Sleep(1000);
            // Code block should NOT exist on workspace
            try
            {
                driver.FindElement(By.ClassName("node-data-container"));
                Assert.Fail("Unexpected element");
            }
            catch (NoSuchElementException)
            {
            }
        }

        [Test]
        public void T02_CreateNotEmptyCodeBlockTest()
        {
            // Create not empty CBN.
            var search = driver.FindElement(By.Id("bottom-search"));
            search.SendKeys("code");
            Thread.Sleep(1000);
            search = driver.FindElement(By.Id("bottom-search"));
            search.SendKeys(Keys.Return);
            Thread.Sleep(1000);
            // Code block should exist on workspace
            driver.FindElement(By.ClassName("node-data-container"));
        }

        [Test]
        public void T03_ChangeCodeBlockValueTest()
        {
            var textInput = driver.FindElement(By.ClassName("code-block-input"));
            textInput.SendKeys("A = B;");
            Thread.Sleep(1000);

            var container = driver.FindElement(By.Id("top_container"));
            container.Click();
            Thread.Sleep(2000);

            Assert.IsTrue(driver.FindElements(By.ClassName("node-port-output")).Count == 1);
            Assert.IsTrue(driver.FindElements(By.ClassName("node-port-input")).Count == 1);

            textInput = driver.FindElement(By.ClassName("code-block-input"));
            textInput.SendKeys(Keys.Return);
            textInput.SendKeys("C = 1;");
            Thread.Sleep(1000);
            container = driver.FindElement(By.Id("top_container"));
            container.Click();
            Thread.Sleep(2000);

            Assert.IsTrue(driver.FindElements(By.ClassName("node-port-output")).Count == 2);
            Assert.IsTrue(driver.FindElements(By.ClassName("node-port-input")).Count == 1);

            // Type inappropriate code in CBN.
            textInput = driver.FindElement(By.ClassName("code-block-input"));
            textInput.SendKeys(Keys.Return);
            textInput.SendKeys("X=");
            Thread.Sleep(1000);
            container = driver.FindElement(By.Id("top_container"));
            container.Click();
            Thread.Sleep(2000);

            Assert.IsTrue(driver.PageSource.Contains("invalid Associative_FunctionalStatement"));
        }

        [Test]
        public void T04_RemoveCodeBlockTest()
        {
            // Delete CBN
            var node = driver.FindElement(By.ClassName("node-settings"));
            node.Click();
            Thread.Sleep(1000);

            var actions = new Actions(driver);
            actions.SendKeys(Keys.Delete).Build().Perform();
            Thread.Sleep(1000);

            // Code block should NOT exist on workspace
            try
            {
                driver.FindElement(By.ClassName("node-data-container"));
                Assert.Fail("Unexpected element");
            }
            catch (NoSuchElementException)
            {
            }
        }

    }
}
