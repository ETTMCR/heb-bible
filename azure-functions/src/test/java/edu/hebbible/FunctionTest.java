package edu.hebbible;

import com.microsoft.azure.functions.*;
import org.mockito.invocation.InvocationOnMock; //
import org.mockito.stubbing.Answer;

import java.util.*;
import java.util.logging.Logger;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class FunctionTest {

  @Test
  public void testHttpTriggerJava() {
    // Setup
    @SuppressWarnings("unchecked")
    final HttpRequestMessage<Optional<String>> req = mock(HttpRequestMessage.class);

    final Map<String, String> queryParams = new HashMap<>();
    queryParams.put("name", "שחר");
    // queryParams.put("containsName", "true");
    doReturn(queryParams).when(req).getQueryParameters();

    final Optional<String> queryBody = Optional.empty();
    doReturn(queryBody).when(req).getBody();

    doAnswer(new Answer<HttpResponseMessage.Builder>() {
      @Override
      public HttpResponseMessage.Builder answer(InvocationOnMock invocation) {
        HttpStatus status = (HttpStatus) invocation.getArguments()[0];
        return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
      }
    }).when(req).createResponseBuilder(any(HttpStatus.class));

    final ExecutionContext context = mock(ExecutionContext.class);
    doReturn(Logger.getGlobal()).when(context).getLogger();

    // Invoke
    final HttpResponseMessage ret = new Function().run(req, context);

    // Verify
    assertEquals(ret.getStatus(), HttpStatus.OK);
    assertEquals(ret.getBody(), "Total Psukim: 25");
  }
}
