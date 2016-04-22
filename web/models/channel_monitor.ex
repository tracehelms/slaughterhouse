defmodule Slaughterhouse.ChannelMonitor do
  use GenServer

  def start_link(initial_state) do
   GenServer.start_link(__MODULE__, initial_state, name: __MODULE__)
  end

  def user_joined(user_id) do
   GenServer.call(__MODULE__, {:user_joined, user_id})
  end

  def move_player(user_id, location) do
   GenServer.call(__MODULE__, {:move_player, user_id, location})
  end

  # def user_left(channel, user_id) do
  #   GenServer.call(__MODULE__, {:user_left, channel, user_id})
  # end

  # GenServer implementation
  def handle_call({:user_joined, user_id}, _from, state) do
    new_state = case Map.get(state, user_id) do
      nil ->
        Map.put(state, user_id, %{x: 0, y: 0})
      _ ->
        state
    end

    {:reply, new_state, new_state}
  end

  def handle_call({:move_player, user_id, {x, y}}, _from, state) do
    new_state = case Map.get(state, user_id) do
      nil ->
        state
      _ ->
        Map.put(state, user_id, %{x: x, y: y})
    end

    {:reply, new_state, new_state}
  end

  # def handle_call({:user_left, channel, user_id}, _from, state) do
  #   new_users = state
  #     |> Map.get(channel)
  #     |> Enum.reject(&(&1.id == user_id))
  #
  #   new_state = Map.update!(state, channel, fn(_) -> new_users end)
  #
  #   {:reply, new_state, new_state}
  # end
end
