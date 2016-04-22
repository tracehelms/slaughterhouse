defmodule Slaughterhouse.LobbyChannel do
  use Slaughterhouse.Web, :channel
  alias Slaughterhouse.ChannelMonitor

  def join("game:lobby", _payload, socket) do
    user_id = socket.assigns.user_id
    state = ChannelMonitor.user_joined(user_id)
    send self, {:after_join, state}
    {:ok, socket}
  end

  def handle_info({:after_join, state}, socket) do
    broadcast! socket, "player_joined", %{state: state}
    {:noreply, socket}
  end

  # def terminate(_reason, socket) do
  #   user_id = socket.assigns.current_user.id
  #   users = ChannelMonitor.user_left("game:lobby", user_id)["game:lobby"]
  #   lobby_update(socket, users)
  #   :ok
  # end
  #
  # def handle_in("add_player", _payload, socket) do
  #   user_id = socket.assigns.user_id
  #   # state = ChannelMonitor.user_joined(user_id)
  #   # broadcast! socket, "add_player", %{user_id: user_id}
  #   push socket, "add_player", %{user_id: user_id}
  #   {:noreply, socket}
  # end
  #
  def handle_in("player_moved", %{"x" => x, "y" => y}, socket) do
    user_id = socket.assigns.user_id
    state = ChannelMonitor.move_player(user_id, {x, y})
    broadcast! socket, "player_moved", %{state: state}
    {:noreply, socket}
  end
end
